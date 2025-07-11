import fs from 'fs';
import {
  LLMBehaviorController,
  Phase
} from '../types';
import { ExternalMCPController } from './ExternalMCPController';

/**
 * 制約設定管理システム
 * 汎用化された制約設定の動的管理と適用
 */
export class ConstraintConfigurationManager {
  private behaviorController: LLMBehaviorController;
  // private _externalMCPController: ExternalMCPController;
  private configurationHistory: Array<{
    timestamp: number;
    configuration: LLMBehaviorController;
    reason: string;
  }> = [];

  constructor(
    behaviorController: LLMBehaviorController,
    _externalMCPController: ExternalMCPController
  ) {
    this.behaviorController = behaviorController;
    // this._externalMCPController = _externalMCPController;
  }

  /**
   * 設定ファイルから制約設定を読み込み
   * @param configFilePath - 設定ファイルのパス
   * @returns 読み込まれた制約設定
   */
  async loadConstraintConfiguration(configFilePath: string): Promise<LLMBehaviorController> {
    try {
      const configData = await fs.promises.readFile(configFilePath, 'utf8');
      const config = JSON.parse(configData);
      
      // 設定の検証
      this.validateConfiguration(config);
      
      // 設定の適用
      this.applyConfiguration(config);
      
      return this.behaviorController;
    } catch (error) {
      throw new Error(`Failed to load constraint configuration: ${error}`);
    }
  }

  /**
   * 制約設定を設定ファイルに保存
   * @param configFilePath - 設定ファイルのパス
   * @param config - 保存する制約設定
   */
  async saveConstraintConfiguration(
    configFilePath: string,
    config: LLMBehaviorController = this.behaviorController
  ): Promise<void> {
    try {
      const configData = JSON.stringify(config, null, 2);
      await fs.promises.writeFile(configFilePath, configData, 'utf8');
    } catch (error) {
      throw new Error(`Failed to save constraint configuration: ${error}`);
    }
  }

  /**
   * ユースケース別の制約設定を生成
   * @param useCase - ユースケース識別子
   * @param customParams - カスタムパラメータ
   * @returns 生成された制約設定
   */
  generateUseCaseConfiguration(
    useCase: string,
    customParams: Record<string, any> = {}
  ): LLMBehaviorController {
    switch (useCase) {
      case 'document-creation':
        return this.createDocumentCreationConfiguration(customParams);
      case 'technology-constraints':
        return this.createTechnologyConstraintsConfiguration(customParams);
      case 'project-conventions':
        return this.createProjectConventionsConfiguration(customParams);
      case 'code-quality':
        return this.createCodeQualityConfiguration(customParams);
      case 'security-compliance':
        return this.createSecurityComplianceConfiguration(customParams);
      default:
        throw new Error(`Unknown use case: ${useCase}`);
    }
  }

  /**
   * UC1: ドキュメント作成制約設定
   */
  private createDocumentCreationConfiguration(params: Record<string, any>): LLMBehaviorController {
    const qualityThresholds = params.qualityThresholds || {};

    return {
      mandatoryExecutionConstraints: {
        enforceFileReadBeforeModification: true,
        enforcePhaseProgression: true,
        enforceQualityValidation: true,
        enforceExternalDependencyResolution: false,
        customConstraints: [
          {
            id: 'DOCUMENT_COMPLETENESS',
            name: 'Document Completeness Validation',
            condition: 'documentType === "api-spec"',
            violationMessage: 'API specification document is incomplete',
            resolutionSteps: [
              'Add request/response examples for each endpoint',
              'Include error response definitions',
              'Specify authentication requirements',
              'Add rate limiting information'
            ],
            severity: 'high' as const,
            applicablePhases: ['WRITE_OR_REFACTOR', 'PRESENT'] as Phase[]
          },
          {
            id: 'SEQUENCE_DIAGRAM_VALIDATION',
            name: 'Sequence Diagram Parameter Validation',
            condition: 'documentType === "sequence-diagram"',
            violationMessage: 'Sequence diagram messages lack parameter specifications',
            resolutionSteps: [
              'Add mandatory parameters for each message',
              'Specify optional parameters where applicable',
              'Include parameter types and descriptions',
              'Add validation rules for parameters'
            ],
            severity: 'high' as const,
            applicablePhases: ['WRITE_OR_REFACTOR', 'PRESENT'] as Phase[]
          }
        ]
      },
      qualityAssuranceConstraints: {
        minimumQualityStandards: {
          'apiEndpointExamples': qualityThresholds.apiEndpointExamples || 2,
          'sequenceDiagramParameterCoverage': qualityThresholds.sequenceDiagramParameterCoverage || 100,
          'testCaseCoverage': qualityThresholds.testCaseCoverage || 90,
          ...qualityThresholds
        },
        completenessChecks: [
          {
            id: 'API_COMPLETENESS',
            target: 'apiSpecification',
            requiredElements: ['endpoints', 'requestExamples', 'responseExamples', 'errorCodes'],
            checkCondition: 'documentType === "api-spec"',
            incompleteMessage: 'API specification is missing required elements'
          },
          {
            id: 'SEQUENCE_COMPLETENESS',
            target: 'sequenceDiagram',
            requiredElements: ['actors', 'messages', 'parameters', 'returnValues'],
            checkCondition: 'documentType === "sequence-diagram"',
            incompleteMessage: 'Sequence diagram is missing required elements'
          }
        ],
        consistencyChecks: [
          {
            id: 'API_CONSISTENCY',
            targetPair: ['apiSpecification', 'testCases'],
            consistencyCondition: 'testCases.endpoints === apiSpecification.endpoints',
            inconsistentMessage: 'Test cases do not match API specification endpoints'
          }
        ],
        autoFixConfiguration: {
          enabled: true,
          fixableIssueTypes: ['missing-examples', 'incomplete-parameters'],
          maxFixAttempts: 3,
          revalidateAfterFix: true
        }
      },
      externalSystemControl: ExternalMCPController.createDefaultExternalSystemControl(),
      dynamicConstraintConfiguration: {
        runtimeConstraintUpdates: true,
        learningBasedConstraints: false,
        contextDependentConstraints: [],
        userDefinedConstraints: []
      }
    };
  }

  /**
   * UC2: 技術選択制約設定
   */
  private createTechnologyConstraintsConfiguration(params: Record<string, any>): LLMBehaviorController {
    const prohibitedPatterns = params.prohibitedPatterns || [];

    return {
      mandatoryExecutionConstraints: {
        enforceFileReadBeforeModification: true,
        enforcePhaseProgression: true,
        enforceQualityValidation: true,
        enforceExternalDependencyResolution: true,
        customConstraints: [
          {
            id: 'TECHNOLOGY_CONSTRAINTS',
            name: 'Technology Choice Validation',
            condition: JSON.stringify({
              allowedFrameworks: params.allowedTechnologies?.frameworks || ['React', 'Next.js', 'Express.js'],
              allowedDatabases: params.allowedTechnologies?.databases || ['PostgreSQL', 'Redis'],
              allowedCloudServices: params.allowedTechnologies?.cloudServices || ['AWS S3', 'AWS Lambda'],
              prohibitedPatterns: prohibitedPatterns,
              mandatoryPatterns: params.mandatoryPatterns || ['Repository Pattern', 'Dependency Injection']
            }),
            violationMessage: 'Selected technology is not approved for this project',
            resolutionSteps: [
              'Choose from approved technology list',
              'Request approval for new technology',
              'Update project constraints if requirements changed',
              'Consider alternatives within approved technologies'
            ],
            severity: 'critical' as const,
            applicablePhases: ['PLANNING', 'WRITE_OR_REFACTOR'] as Phase[]
          }
        ]
      },
      qualityAssuranceConstraints: {
        minimumQualityStandards: {
          'technologyCompliance': 100,
          'patternCompliance': 95,
          'architectureConsistency': 90
        },
        completenessChecks: [
          {
            id: 'TECHNOLOGY_DOCUMENTATION',
            target: 'technologyChoices',
            requiredElements: ['framework', 'database', 'deployment', 'justification'],
            checkCondition: 'phase === "PLANNING"',
            incompleteMessage: 'Technology choices documentation is incomplete'
          }
        ],
        consistencyChecks: [
          {
            id: 'TECHNOLOGY_CONSISTENCY',
            targetPair: ['technologyChoices', 'implementation'],
            consistencyCondition: 'implementation.framework === technologyChoices.framework',
            inconsistentMessage: 'Implementation does not match approved technology choices'
          }
        ],
        autoFixConfiguration: {
          enabled: false, // 技術選択の自動修正は無効
          fixableIssueTypes: [],
          maxFixAttempts: 0,
          revalidateAfterFix: false
        }
      },
      externalSystemControl: ExternalMCPController.createDefaultExternalSystemControl(),
      dynamicConstraintConfiguration: {
        runtimeConstraintUpdates: false,
        learningBasedConstraints: false,
        contextDependentConstraints: [],
        userDefinedConstraints: []
      }
    };
  }

  /**
   * UC3: プロジェクト規約制約設定
   */
  private createProjectConventionsConfiguration(params: Record<string, any>): LLMBehaviorController {
    const conventions = params.conventions || {};

    return {
      mandatoryExecutionConstraints: {
        enforceFileReadBeforeModification: true,
        enforcePhaseProgression: true,
        enforceQualityValidation: true,
        enforceExternalDependencyResolution: true,
        customConstraints: [
          {
            id: 'CODING_STANDARDS',
            name: 'Coding Standards Compliance',
            condition: 'action === "write" || action === "modify"',
            violationMessage: 'Code does not meet project coding standards',
            resolutionSteps: [
              'Follow project coding style guide',
              'Use consistent naming conventions',
              'Add appropriate comments and documentation',
              'Ensure proper error handling'
            ],
            severity: 'high' as const,
            applicablePhases: ['WRITE_OR_REFACTOR', 'LINT'] as Phase[]
          },
          {
            id: 'SECURITY_COMPLIANCE',
            name: 'Security Compliance Validation',
            condition: 'action === "write" || action === "modify"',
            violationMessage: 'Code does not meet security compliance requirements',
            resolutionSteps: [
              'Remove hardcoded secrets and credentials',
              'Use parameterized queries for database operations',
              'Implement proper input validation',
              'Add security headers and authentication'
            ],
            severity: 'critical' as const,
            applicablePhases: ['WRITE_OR_REFACTOR', 'TEST'] as Phase[]
          }
        ]
      },
      qualityAssuranceConstraints: {
        minimumQualityStandards: {
          'codeCompliance': conventions.codeCompliance || 95,
          'securityCompliance': params.securityRules?.securityCompliance || 100,
          'documentationCoverage': conventions.documentationCoverage || 80,
          'testCoverage': conventions.testCoverage || 85
        },
        completenessChecks: [
          {
            id: 'SECURITY_CHECKS',
            target: 'codeFiles',
            requiredElements: ['authentication', 'authorization', 'inputValidation'],
            checkCondition: 'securityCritical === true',
            incompleteMessage: 'Security-critical code is missing required security elements'
          }
        ],
        consistencyChecks: [
          {
            id: 'NAMING_CONSISTENCY',
            targetPair: ['codeFiles', 'conventions'],
            consistencyCondition: 'codeFiles.namingStyle === conventions.namingStyle',
            inconsistentMessage: 'Code naming does not follow project conventions'
          }
        ],
        autoFixConfiguration: {
          enabled: true,
          fixableIssueTypes: ['formatting', 'naming', 'comments'],
          maxFixAttempts: 3,
          revalidateAfterFix: true
        }
      },
      externalSystemControl: {
        ...ExternalMCPController.createDefaultExternalSystemControl(),
        fileSystemControl: {
          ...ExternalMCPController.createDefaultExternalSystemControl().fileSystemControl,
          restrictedPaths: [
            ...ExternalMCPController.createDefaultExternalSystemControl().fileSystemControl.restrictedPaths,
            './config/secrets',
            './keys',
            './.env.production'
          ]
        }
      },
      dynamicConstraintConfiguration: {
        runtimeConstraintUpdates: true,
        learningBasedConstraints: true,
        contextDependentConstraints: [],
        userDefinedConstraints: []
      }
    };
  }

  /**
   * コード品質制約設定
   */
  private createCodeQualityConfiguration(params: Record<string, any>): LLMBehaviorController {
    const qualityMetrics = params.qualityMetrics || {};

    return {
      mandatoryExecutionConstraints: {
        enforceFileReadBeforeModification: true,
        enforcePhaseProgression: true,
        enforceQualityValidation: true,
        enforceExternalDependencyResolution: false,
        customConstraints: [
          {
            id: 'CODE_QUALITY_METRICS',
            name: 'Code Quality Metrics Validation',
            condition: 'action === "write" || action === "modify"',
            violationMessage: 'Code does not meet minimum quality metrics',
            resolutionSteps: [
              'Reduce code complexity',
              'Improve test coverage',
              'Add proper documentation',
              'Refactor duplicate code'
            ],
            severity: 'high' as const,
            applicablePhases: ['WRITE_OR_REFACTOR', 'LINT', 'TEST'] as Phase[]
          }
        ]
      },
      qualityAssuranceConstraints: {
        minimumQualityStandards: {
          'complexity': qualityMetrics.maxComplexity || 10,
          'testCoverage': qualityMetrics.minTestCoverage || 80,
          'duplication': qualityMetrics.maxDuplication || 5,
          'maintainabilityIndex': qualityMetrics.minMaintainabilityIndex || 70
        },
        completenessChecks: [
          {
            id: 'QUALITY_DOCUMENTATION',
            target: 'codeFiles',
            requiredElements: ['docstrings', 'comments', 'typeAnnotations'],
            checkCondition: 'true',
            incompleteMessage: 'Code files are missing required documentation'
          }
        ],
        consistencyChecks: [
          {
            id: 'QUALITY_CONSISTENCY',
            targetPair: ['codeFiles', 'qualityStandards'],
            consistencyCondition: 'codeFiles.qualityScore >= qualityStandards.minimum',
            inconsistentMessage: 'Code quality does not meet project standards'
          }
        ],
        autoFixConfiguration: {
          enabled: true,
          fixableIssueTypes: ['formatting', 'imports', 'documentation'],
          maxFixAttempts: 5,
          revalidateAfterFix: true
        }
      },
      externalSystemControl: ExternalMCPController.createDefaultExternalSystemControl(),
      dynamicConstraintConfiguration: {
        runtimeConstraintUpdates: true,
        learningBasedConstraints: true,
        contextDependentConstraints: [],
        userDefinedConstraints: []
      }
    };
  }

  /**
   * セキュリティ・コンプライアンス制約設定
   */
  private createSecurityComplianceConfiguration(params: Record<string, any>): LLMBehaviorController {
    const securityStandards = params.securityStandards || {};

    return {
      mandatoryExecutionConstraints: {
        enforceFileReadBeforeModification: true,
        enforcePhaseProgression: true,
        enforceQualityValidation: true,
        enforceExternalDependencyResolution: true,
        customConstraints: [
          {
            id: 'SECURITY_STANDARDS',
            name: 'Security Standards Compliance',
            condition: 'true',
            violationMessage: 'Code does not meet security compliance standards',
            resolutionSteps: [
              'Remove hardcoded secrets',
              'Implement proper authentication',
              'Add input validation',
              'Use secure communication protocols'
            ],
            severity: 'critical' as const,
            applicablePhases: ['WRITE_OR_REFACTOR', 'TEST'] as Phase[]
          }
        ]
      },
      qualityAssuranceConstraints: {
        minimumQualityStandards: {
          'securityScore': securityStandards.minSecurityScore || 95,
          'vulnerabilityCount': securityStandards.maxVulnerabilities || 0,
          'complianceScore': securityStandards.minComplianceScore || 90
        },
        completenessChecks: [
          {
            id: 'SECURITY_COMPLETENESS',
            target: 'securityFeatures',
            requiredElements: ['authentication', 'authorization', 'encryption', 'logging'],
            checkCondition: 'true',
            incompleteMessage: 'Security features are incomplete'
          }
        ],
        consistencyChecks: [
          {
            id: 'SECURITY_CONSISTENCY',
            targetPair: ['securityImplementation', 'securityStandards'],
            consistencyCondition: 'securityImplementation.level >= securityStandards.required',
            inconsistentMessage: 'Security implementation does not meet standards'
          }
        ],
        autoFixConfiguration: {
          enabled: false, // セキュリティ問題の自動修正は慎重に
          fixableIssueTypes: [],
          maxFixAttempts: 0,
          revalidateAfterFix: false
        }
      },
      externalSystemControl: {
        ...ExternalMCPController.createDefaultExternalSystemControl(),
        allowedMCPTools: ['structured-workflow-mcp', 'filesystem'], // 制限的なリスト
        restrictedMCPTools: ['shell-access', 'system-admin', 'network-access'],
        fileSystemControl: {
          ...ExternalMCPController.createDefaultExternalSystemControl().fileSystemControl,
          restrictedPaths: [
            ...ExternalMCPController.createDefaultExternalSystemControl().fileSystemControl.restrictedPaths,
            './secrets',
            './keys',
            './.env'
          ]
        }
      },
      dynamicConstraintConfiguration: {
        runtimeConstraintUpdates: false,
        learningBasedConstraints: false,
        contextDependentConstraints: [],
        userDefinedConstraints: []
      }
    };
  }

  /**
   * 制約設定の検証
   */
  private validateConfiguration(config: any): void {
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid configuration format');
    }

    const requiredFields = [
      'mandatoryExecutionConstraints',
      'qualityAssuranceConstraints',
      'externalSystemControl',
      'dynamicConstraintConfiguration'
    ];

    for (const field of requiredFields) {
      if (!(field in config)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  /**
   * 制約設定の適用
   */
  private applyConfiguration(config: LLMBehaviorController): void {
    this.behaviorController = config;
    
    // 設定変更履歴の記録
    this.configurationHistory.push({
      timestamp: Date.now(),
      configuration: JSON.parse(JSON.stringify(config)),
      reason: 'Configuration loaded from file'
    });

    // 履歴の制限（最新10件のみ保持）
    if (this.configurationHistory.length > 10) {
      this.configurationHistory = this.configurationHistory.slice(-10);
    }
  }

  /**
   * 設定変更履歴の取得
   */
  getConfigurationHistory(): Array<{
    timestamp: number;
    configuration: LLMBehaviorController;
    reason: string;
  }> {
    return [...this.configurationHistory];
  }

  /**
   * 現在の制約設定を取得
   */
  getCurrentConfiguration(): LLMBehaviorController {
    return JSON.parse(JSON.stringify(this.behaviorController));
  }

  /**
   * 制約設定のマージ
   */
  mergeConfigurations(
    baseConfig: LLMBehaviorController,
    overrideConfig: Partial<LLMBehaviorController>
  ): LLMBehaviorController {
    return {
      ...baseConfig,
      ...overrideConfig,
      mandatoryExecutionConstraints: {
        ...baseConfig.mandatoryExecutionConstraints,
        ...overrideConfig.mandatoryExecutionConstraints
      },
      qualityAssuranceConstraints: {
        ...baseConfig.qualityAssuranceConstraints,
        ...overrideConfig.qualityAssuranceConstraints
      },
      externalSystemControl: {
        ...baseConfig.externalSystemControl,
        ...overrideConfig.externalSystemControl
      },
      dynamicConstraintConfiguration: {
        ...baseConfig.dynamicConstraintConfiguration,
        ...overrideConfig.dynamicConstraintConfiguration
      }
    };
  }
}