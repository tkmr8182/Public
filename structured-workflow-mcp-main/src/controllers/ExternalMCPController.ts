import {
  ExternalSystemControl,
  ConstraintViolationError,
  APIKeyManagement
} from '../types';

/**
 * 外部MCP制御システム
 * 他のMCPツールや外部システムの利用を物理的に制御
 */
export class ExternalMCPController {
  private externalSystemControl: ExternalSystemControl;

  constructor(externalSystemControl: ExternalSystemControl) {
    this.externalSystemControl = externalSystemControl;
  }

  /**
   * MCPツールの利用可否を検証
   * @param toolName - 利用しようとするMCPツール名
   * @throws ConstraintViolationError 制約違反時
   */
  validateMCPToolUsage(toolName: string): void {
    // ホワイトリストチェック
    if (this.externalSystemControl.allowedMCPTools.length > 0) {
      if (!this.externalSystemControl.allowedMCPTools.includes(toolName)) {
        throw this.createConstraintViolationError(
          'MCP_TOOL_NOT_ALLOWED',
          `MCP tool '${toolName}' is not in the allowed list`,
          {
            toolName,
            allowedTools: this.externalSystemControl.allowedMCPTools
          },
          [
            `Use only approved MCP tools: ${this.externalSystemControl.allowedMCPTools.join(', ')}`,
            'Request approval for new MCP tool if needed',
            'Check the MCP tool whitelist configuration'
          ]
        );
      }
    }

    // ブラックリストチェック
    if (this.externalSystemControl.restrictedMCPTools.includes(toolName)) {
      throw this.createConstraintViolationError(
        'MCP_TOOL_RESTRICTED',
        `MCP tool '${toolName}' is restricted and cannot be used`,
        {
          toolName,
          restrictedTools: this.externalSystemControl.restrictedMCPTools
        },
        [
          'Use alternative MCP tools',
          'Remove tool from restricted list if appropriate',
          'Check the MCP tool restriction policy'
        ]
      );
    }
  }

  /**
   * 外部APIエンドポイントの利用可否を検証
   * @param endpoint - 利用しようとするAPIエンドポイント
   * @throws ConstraintViolationError 制約違反時
   */
  validateAPIEndpointUsage(endpoint: string): void {
    const apiControl = this.externalSystemControl.externalAPIControl;
    
    if (apiControl.allowedEndpoints.length > 0) {
      const isAllowed = apiControl.allowedEndpoints.some(allowed => 
        endpoint.startsWith(allowed)
      );
      
      if (!isAllowed) {
        throw this.createConstraintViolationError(
          'API_ENDPOINT_NOT_ALLOWED',
          `API endpoint '${endpoint}' is not in the allowed list`,
          {
            endpoint,
            allowedEndpoints: apiControl.allowedEndpoints
          },
          [
            'Use only approved API endpoints',
            'Check the API endpoint whitelist configuration',
            'Request approval for new API endpoint if needed'
          ]
        );
      }
    }
  }

  /**
   * API利用のレート制限チェック
   * @param endpoint - APIエンドポイント
   * @param requestCount - リクエスト数
   * @returns 制限内かどうか
   */
  checkRateLimit(endpoint: string, requestCount: number): boolean {
    const apiControl = this.externalSystemControl.externalAPIControl;
    const limit = apiControl.rateLimits[endpoint];
    
    if (limit && requestCount > limit) {
      return false;
    }
    
    return true;
  }

  /**
   * APIキーの有効性チェック
   * @param apiKey - APIキー
   * @param keyManagement - キー管理設定
   * @returns 有効かどうか
   */
  validateAPIKey(apiKey: string, keyManagement: APIKeyManagement): boolean {
    // 基本的な検証（実際の実装では、より厳密な検証を行う）
    if (!apiKey || apiKey.length < 10) {
      return false;
    }

    // 有効期限チェック（実装例）
    if (keyManagement.expiration) {
      const now = Date.now();
      const keyTimestamp = this.extractTimestampFromKey(apiKey);
      if (keyTimestamp && (now - keyTimestamp) > keyManagement.expiration) {
        return false;
      }
    }

    return true;
  }

  /**
   * ファイルシステムアクセス制御
   * @param filePath - ファイルパス
   * @param operation - 操作タイプ
   * @param mcpToolName - 操作を行うMCPツール名
   * @throws ConstraintViolationError 制約違反時
   */
  validateFileSystemAccess(filePath: string, operation: 'read' | 'write' | 'delete', mcpToolName: string): void {
    const fsControl = this.externalSystemControl.fileSystemControl;
    
    // パストラバーサル防止
    if (fsControl.preventPathTraversal && (filePath.includes('../') || filePath.includes('..\\'))) {
      throw this.createConstraintViolationError(
        'PATH_TRAVERSAL_VIOLATION',
        `Path traversal detected in file path: ${filePath}`,
        {
          filePath,
          operation,
          mcpToolName
        },
        [
          'Use absolute paths only',
          'Avoid relative path navigation',
          'Check file path construction logic'
        ]
      );
    }

    // 制限パスチェック
    if (fsControl.restrictedPaths.some(path => filePath.startsWith(path))) {
      throw this.createConstraintViolationError(
        'RESTRICTED_PATH_VIOLATION',
        `Access to restricted path: ${filePath}`,
        {
          filePath,
          operation,
          mcpToolName,
          restrictedPaths: fsControl.restrictedPaths
        },
        [
          'Use allowed paths only',
          'Check file system access permissions',
          'Verify the file path is within allowed directories'
        ]
      );
    }

    // 読み取り権限チェック
    if (operation === 'read' && fsControl.readablePaths.length > 0) {
      const hasReadAccess = fsControl.readablePaths.some(path => filePath.startsWith(path));
      if (!hasReadAccess) {
        throw this.createConstraintViolationError(
          'READ_ACCESS_VIOLATION',
          `Read access denied for path: ${filePath}`,
          {
            filePath,
            operation,
            mcpToolName,
            readablePaths: fsControl.readablePaths
          },
          [
            'Use paths with read permission',
            'Check readable paths configuration',
            'Verify file system permissions'
          ]
        );
      }
    }

    // 書き込み権限チェック
    if ((operation === 'write' || operation === 'delete') && fsControl.writablePaths.length > 0) {
      const hasWriteAccess = fsControl.writablePaths.some(path => filePath.startsWith(path));
      if (!hasWriteAccess) {
        throw this.createConstraintViolationError(
          'WRITE_ACCESS_VIOLATION',
          `Write access denied for path: ${filePath}`,
          {
            filePath,
            operation,
            mcpToolName,
            writablePaths: fsControl.writablePaths
          },
          [
            'Use paths with write permission',
            'Check writable paths configuration',
            'Verify file system permissions'
          ]
        );
      }
    }
  }

  /**
   * 外部システム制御設定の更新
   * @param newControl - 新しい制御設定
   */
  updateExternalSystemControl(newControl: Partial<ExternalSystemControl>): void {
    this.externalSystemControl = {
      ...this.externalSystemControl,
      ...newControl
    };
  }

  /**
   * 現在の制御設定を取得
   * @returns 現在の外部システム制御設定
   */
  getExternalSystemControl(): ExternalSystemControl {
    return { ...this.externalSystemControl };
  }

  /**
   * MCP間の依存関係チェック
   * @param requiredTools - 必要なMCPツール
   * @returns 依存関係が満たされているかどうか
   */
  checkMCPDependencies(requiredTools: string[]): boolean {
    const allowedTools = this.externalSystemControl.allowedMCPTools;
    const restrictedTools = this.externalSystemControl.restrictedMCPTools;

    // 必要なツールがすべて許可されているかチェック
    if (allowedTools.length > 0) {
      const missingTools = requiredTools.filter(tool => !allowedTools.includes(tool));
      if (missingTools.length > 0) {
        return false;
      }
    }

    // 必要なツールが制限されていないかチェック
    const blockedTools = requiredTools.filter(tool => restrictedTools.includes(tool));
    if (blockedTools.length > 0) {
      return false;
    }

    return true;
  }

  /**
   * 外部システムとの通信設定検証
   * @param systemName - 外部システム名
   * @param config - 通信設定
   * @returns 設定が有効かどうか
   */
  validateExternalSystemConfig(systemName: string, config: Record<string, any>): boolean {
    // 基本的な設定検証
    if (!config || typeof config !== 'object') {
      return false;
    }

    // システム固有の検証（実装例）
    if (systemName === 'github' && (!config.token || !config.repository)) {
      return false;
    }

    if (systemName === 'jira' && (!config.url || !config.username || !config.token)) {
      return false;
    }

    return true;
  }

  /**
   * 制約違反エラーの作成
   */
  private createConstraintViolationError(
    constraintId: string,
    message: string,
    violationDetails: Record<string, any>,
    resolutionSteps: string[]
  ): ConstraintViolationError {
    const error = new Error(message) as ConstraintViolationError;
    error.name = 'ConstraintViolationError';
    error.constraintId = constraintId;
    error.violationDetails = violationDetails;
    error.resolutionSteps = resolutionSteps;
    error.severity = 'high';
    return error;
  }

  /**
   * APIキーからタイムスタンプを抽出（実装例）
   */
  private extractTimestampFromKey(apiKey: string): number | null {
    // 実際の実装では、APIキーの形式に応じて適切に実装
    // ここでは基本的な例として、キーの末尾が数値の場合のみ処理
    const match = apiKey.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * デフォルト外部システム制御設定の作成
   */
  static createDefaultExternalSystemControl(): ExternalSystemControl {
    return {
      allowedMCPTools: [
        'filesystem',
        'web-search',
        'github',
        'npm',
        'structured-workflow-mcp'
      ],
      restrictedMCPTools: [
        'system-admin',
        'database-direct',
        'shell-access'
      ],
      externalAPIControl: {
        allowedEndpoints: [
          'https://api.github.com',
          'https://api.npmjs.org',
          'https://search.google.com'
        ],
        apiKeyManagement: {
          encrypted: true,
          expiration: 86400000, // 24時間
          rotation: false
        },
        rateLimits: {
          'https://api.github.com': 5000,
          'https://api.npmjs.org': 1000
        },
        timeouts: {
          'https://api.github.com': 30000,
          'https://api.npmjs.org': 15000
        }
      },
      fileSystemControl: {
        readablePaths: [
          '/home',
          '/tmp',
          '/var/tmp',
          './src',
          './docs',
          './tests'
        ],
        writablePaths: [
          '/tmp',
          '/var/tmp',
          './src',
          './docs',
          './tests',
          './output'
        ],
        restrictedPaths: [
          '/etc',
          '/usr/bin',
          '/sys',
          '/proc',
          '/boot',
          '/root'
        ],
        preventPathTraversal: true
      }
    };
  }
}