import { FileItem } from '../shared/types';
import * as fs from 'fs/promises';
import { readFileSync } from 'fs';

interface FileFeatures {
  extension: string;
  fileSize?: number;
  nameLength: number;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
  fileHeader?: string; // First 512 bytes as hex
  textScore?: number; // 0-1: likelihood it's a text file
  binaryScore?: number; // 0-1: likelihood it's binary
}

interface MLPrediction {
  category: string;
  confidence: number;
  reason: string;
  features: Partial<FileFeatures>;
}

export class MLClassifier {
  private extensionMap = new Map<string, string>([
    // Documents
    ['.pdf', 'documents'], ['.doc', 'documents'], ['.docx', 'documents'],
    ['.txt', 'documents'], ['.xlsx', 'spreadsheets'], ['.xls', 'spreadsheets'],
    ['.pptx', 'presentations'], ['.ppt', 'presentations'],
    ['.odt', 'documents'], ['.csv', 'spreadsheets'],

    // Images
    ['.jpg', 'images'], ['.jpeg', 'images'], ['.png', 'images'],
    ['.gif', 'images'], ['.bmp', 'images'], ['.webp', 'images'],
    ['.svg', 'images'], ['.ico', 'images'], ['.tiff', 'images'],

    // Audio
    ['.mp3', 'music'], ['.wav', 'music'], ['.flac', 'music'],
    ['.aac', 'music'], ['.ogg', 'music'], ['.m4a', 'music'],

    // Video
    ['.mp4', 'video'], ['.avi', 'video'], ['.mov', 'video'],
    ['.mkv', 'video'], ['.flv', 'video'], ['.wmv', 'video'],

    // Archives
    ['.zip', 'archives'], ['.rar', 'archives'], ['.7z', 'archives'],
    ['.tar', 'archives'], ['.gz', 'archives'], ['.bz2', 'archives'],

    // E-Books
    ['.epub', 'ebooks'], ['.mobi', 'ebooks'], ['.azw', 'ebooks'],

    // Code
    ['.js', 'code'], ['.ts', 'code'], ['.jsx', 'code'], ['.tsx', 'code'],
    ['.py', 'code'], ['.java', 'code'], ['.c', 'code'], ['.cpp', 'code'],
    ['.go', 'code'], ['.rb', 'code'], ['.sh', 'code'], ['.html', 'code'],
    ['.css', 'code'], ['.json', 'code'], ['.xml', 'code'],

    // Executables
    ['.exe', 'executable'], ['.msi', 'executable'], ['.bat', 'executable'],
  ]);

  // File signatures (magic numbers) for accurate detection
  private fileSignatures = new Map<string, { signature: string; category: string }>([
    ['PDF', { signature: '25504446', category: 'documents' }], // %PDF
    ['JPEG', { signature: 'FFD8FF', category: 'images' }],
    ['PNG', { signature: '89504E47', category: 'images' }],
    ['GIF', { signature: '474946', category: 'images' }], // GIF
    ['ZIP', { signature: '504B0304', category: 'archives' }], // PK..
    ['RAR', { signature: '526172', category: 'archives' }], // Rar
    ['MP3', { signature: 'FFFB', category: 'music' }],
    ['MP4', { signature: '66747970', category: 'video' }], // ftyp
    ['AVI', { signature: '52494646', category: 'video' }], // RIFF
  ]);

  /**
   * Extract file features for ML analysis
   */
  private async extractFeatures(file: FileItem, filePath: string): Promise<FileFeatures> {
    const extension = file.extension.toLowerCase();
    const fileName = file.name;
    
    let fileHeader = '';
    let textScore = 0;
    let binaryScore = 0;

    try {
      // Read file header (first 512 bytes)
      const buffer = await this.readFileHeader(filePath, 512);
      fileHeader = buffer.toString('hex').substring(0, 32); // First 16 bytes in hex
      
      // Analyze content
      const contentAnalysis = this.analyzeFileContent(buffer);
      textScore = contentAnalysis.textScore;
      binaryScore = contentAnalysis.binaryScore;
    } catch (err) {
      // If can't read file, use default scores
    }

    return {
      extension,
      fileSize: file.size,
      nameLength: fileName.length,
      hasNumbers: /\d/.test(fileName),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(fileName),
      fileHeader,
      textScore,
      binaryScore,
    };
  }

  /**
   * Read first N bytes of file safely
   */
  private async readFileHeader(filePath: string, bytes: number): Promise<Buffer> {
    try {
      const fd = await fs.open(filePath, 'r');
      const buffer = Buffer.alloc(bytes);
      await fd.read(buffer, 0, bytes, 0);
      await fd.close();
      return buffer;
    } catch {
      return Buffer.alloc(0);
    }
  }

  /**
   * Analyze file content to determine if text or binary
   */
  private analyzeFileContent(buffer: Buffer): { textScore: number; binaryScore: number } {
    if (buffer.length === 0) return { textScore: 0.5, binaryScore: 0.5 };

    let textChars = 0;
    let binaryChars = 0;

    for (let i = 0; i < Math.min(buffer.length, 512); i++) {
      const byte = buffer[i];
      // Check if byte is printable ASCII or common text encoding
      if ((byte >= 32 && byte <= 126) || byte === 9 || byte === 10 || byte === 13) {
        textChars++;
      } else if (byte === 0 || (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13)) {
        binaryChars++;
      }
    }

    const total = textChars + binaryChars || 1;
    return {
      textScore: textChars / total,
      binaryScore: binaryChars / total,
    };
  }

  /**
   * Detect file type by file signature (magic bytes)
   */
  private detectBySignature(header: string): string | null {
    for (const [name, { signature, category }] of this.fileSignatures) {
      if (header.toUpperCase().startsWith(signature)) {
        return category;
      }
    }
    return null;
  }

  /**
   * Main ML classification using multiple strategies
   */
  async classifyFile(file: FileItem, filePath?: string): Promise<MLPrediction> {
    try {
      const features = filePath ? await this.extractFeatures(file, filePath) : this.createBasicFeatures(file);
      
      // Strategy 1: File signature detection (most accurate)
      const signatureCategory = features.fileHeader ? this.detectBySignature(features.fileHeader) : null;
      if (signatureCategory) {
        return {
          category: signatureCategory,
          confidence: 0.98,
          reason: 'Detected by file signature (binary header)',
          features,
        };
      }

      // Strategy 2: Extension-based classification (very reliable)
      if (features.extension) {
        const extensionCategory = this.extensionMap.get(features.extension);
        if (extensionCategory) {
          return {
            category: extensionCategory,
            confidence: 0.95,
            reason: `Classified by extension: ${features.extension}`,
            features,
          };
        }
      }

      // Strategy 3: Content-based heuristics
      if (features.textScore && features.textScore > 0.9) {
        return {
          category: 'documents',
          confidence: 0.80,
          reason: 'File content appears to be text',
          features,
        };
      }

      // Strategy 4: Smart size-based categorization
      if (features.fileSize && features.fileSize > 100 * 1024 * 1024) { // > 100MB
        return {
          category: 'video',
          confidence: 0.70,
          reason: 'Large file size suggests media',
          features,
        };
      }

      if (features.fileSize && features.fileSize < 10 * 1024) { // < 10KB
        return {
          category: 'documents',
          confidence: 0.60,
          reason: 'Small file size, likely document or config',
          features,
        };
      }

      // Fallback
      return {
        category: 'other',
        confidence: 0.50,
        reason: 'Could not confidently classify file',
        features,
      };

    } catch (error) {
      console.error('ML Classification error:', error);
      // Fallback to safe classification
      return {
        category: 'other',
        confidence: 0.40,
        reason: 'Classification error - using fallback',
        features: this.createBasicFeatures(file),
      };
    }
  }

  /**
   * Create basic features without file I/O
   */
  private createBasicFeatures(file: FileItem): Partial<FileFeatures> {
    const fileName = file.name;
    return {
      extension: file.extension.toLowerCase(),
      fileSize: file.size,
      nameLength: fileName.length,
      hasNumbers: /\d/.test(fileName),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(fileName),
    };
  }

  /**
   * Batch classify multiple files with caching
   */
  async batchClassify(files: FileItem[], basePath: string): Promise<MLPrediction[]> {
    const results: MLPrediction[] = [];
    
    for (const file of files) {
      try {
        const fullPath = `${basePath}/${file.name}`;
        const prediction = await this.classifyFile(file, fullPath);
        results.push(prediction);
      } catch (error) {
        // Classify without full path
        results.push(await this.classifyFile(file));
      }
    }
    
    return results;
  }
}

