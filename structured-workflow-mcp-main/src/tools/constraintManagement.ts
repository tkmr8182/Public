import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { 
  LLMBehaviorController, 
  TechnologyConstraints,
  CustomConstraintRule,
  Phase
} from '../types/index.js';
import { SessionManager } from '../session/SessionManager.js';

/**
 * 制約設定管理ツール
 */
export function createConstraintManagementTools(): Tool[] {
  return [
    {
      name: 'configure_behavior_constraints',
      description: 'Configure LLM behavior constraints for specific use cases',
      inputSchema: {
        type: 'object',
        properties: {
          useCase: {
            type: 'string',
            description: 'Use case identifier (document-creation, technology-constraints, project-conventions, etc.)',
            enum: ['document-creation', 'technology-constraints', 'project-conventions', 'code-quality', 'security-compliance']
          },
          configuration: {
            type: 'object',
            description: 'Use case specific configuration parameters',
            properties: {
              documentTypes: {
                type: 'array',
                items: { type: 'string' },
                description: 'Document types for document-creation use case'
              },
              allowedTechnologies: {
                type: 'object',
                description: 'Allowed technologies for technology-constraints use case',
                properties: {
                  frameworks: { type: 'array', items: { type: 'string' } },
                  databases: { type: 'array', items: { type: 'string' } },
                  cloudServices: { type: 'array', items: { type: 'string' } }
                }
              },
              qualityThresholds: {
                type: 'object',
                description: 'Quality thresholds for various metrics',
                additionalProperties: { type: 'number' }
              },
              securityStandards: {
                type: 'object',
                description: 'Security standards configuration',
                properties: {
                  minSecurityScore: { type: 'number' },
                  maxVulnerabilities: { type: 'number' }
                }
              },
              conventions: {
                type: 'object',
                description: 'Project conventions configuration',
                properties: {
                  codeCompliance: { type: 'number' },
                  testCoverage: { type: 'number' }
                }
              }
            }
          }
        },
        required: ['useCase']
      }
    },
    {
      name: 'validate_technology_choice',
      description: 'Validate technology choice against configured constraints',
      inputSchema: {
        type: 'object',
        properties: {
          selectedTechnology: {
            type: 'string',
            description: 'The technology being selected'
          },
          technologyType: {
            type: 'string',
            description: 'Type of technology (framework, database, cloudService)',
            enum: ['allowedFrameworks', 'allowedDatabases', 'allowedCloudServices']
          }
        },
        required: ['selectedTechnology', 'technologyType']
      }
    },
    {
      name: 'add_custom_constraint',
      description: 'Add a custom constraint rule to the current session',
      inputSchema: {
        type: 'object',
        properties: {
          constraintRule: {
            type: 'object',
            description: 'Custom constraint rule definition',
            properties: {
              id: { type: 'string', description: 'Unique constraint identifier' },
              name: { type: 'string', description: 'Human-readable constraint name' },
              condition: { type: 'string', description: 'Constraint condition expression' },
              violationMessage: { type: 'string', description: 'Error message when violated' },
              resolutionSteps: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Steps to resolve the violation'
              },
              severity: {
                type: 'string',
                enum: ['critical', 'high', 'medium', 'low'],
                description: 'Constraint severity level'
              },
              applicablePhases: {
                type: 'array',
                items: { type: 'string' },
                description: 'Phases where this constraint applies'
              }
            },
            required: ['id', 'name', 'condition', 'violationMessage', 'resolutionSteps', 'severity', 'applicablePhases']
          }
        },
        required: ['constraintRule']
      }
    },
    {
      name: 'get_constraint_configuration',
      description: 'Get current constraint configuration',
      inputSchema: {
        type: 'object',
        properties: {
          includeHistory: {
            type: 'boolean',
            description: 'Whether to include configuration history',
            default: false
          }
        }
      }
    },
    {
      name: 'load_constraint_configuration',
      description: 'Load constraint configuration from file',
      inputSchema: {
        type: 'object',
        properties: {
          configFilePath: {
            type: 'string',
            description: 'Path to the constraint configuration file'
          }
        },
        required: ['configFilePath']
      }
    },
    {
      name: 'save_constraint_configuration',
      description: 'Save current constraint configuration to file',
      inputSchema: {
        type: 'object',
        properties: {
          configFilePath: {
            type: 'string',
            description: 'Path where to save the constraint configuration'
          }
        },
        required: ['configFilePath']
      }
    }
  ];
}

/**
 * 制約設定管理ツールのハンドラー
 */
export async function handleConstraintManagement(
  toolName: string,
  args: any,
  sessionManager: SessionManager
): Promise<any> {
  switch (toolName) {
    case 'configure_behavior_constraints':
      return await handleConfigureBehaviorConstraints(args, sessionManager);
    
    case 'validate_technology_choice':
      return await handleValidateTechnologyChoice(args, sessionManager);
    
    case 'add_custom_constraint':
      return await handleAddCustomConstraint(args, sessionManager);
    
    case 'get_constraint_configuration':
      return await handleGetConstraintConfiguration(args, sessionManager);
    
    case 'load_constraint_configuration':
      return await handleLoadConstraintConfiguration(args, sessionManager);
    
    case 'save_constraint_configuration':
      return await handleSaveConstraintConfiguration(args, sessionManager);
    
    default:
      throw new Error(`Unknown constraint management tool: ${toolName}`);
  }
}

/**
 * 制約設定の構成
 */
async function handleConfigureBehaviorConstraints(
  args: { useCase: string; configuration?: any },
  sessionManager: SessionManager
): Promise<any> {
  const { useCase, configuration = {} } = args;
  
  let behaviorController: LLMBehaviorController;
  
  // ユースケースに応じた制約設定を生成
  switch (useCase) {
    case 'document-creation':
      behaviorController = createDocumentCreationConstraints(configuration);
      break;
    case 'technology-constraints':
      behaviorController = createTechnologyConstraints(configuration);
      break;
    case 'project-conventions':
      behaviorController = createProjectConventionsConstraints(configuration);
      break;
    case 'code-quality':
      behaviorController = createCodeQualityConstraints(configuration);
      break;
    case 'security-compliance':
      behaviorController = createSecurityComplianceConstraints(configuration);
      break;
    default:
      throw new Error(`Unknown use case: ${useCase}`);
  }
  
  // セッションマネージャーに制約設定を適用
  sessionManager.setBehaviorController(behaviorController);
  
  return {
    success: true,
    message: `Behavior constraints configured for use case: ${useCase}`,
    useCase,
    constraintsApplied: {
      mandatoryExecutionConstraints: behaviorController.mandatoryExecutionConstraints,
      qualityAssuranceConstraints: behaviorController.qualityAssuranceConstraints,
      customConstraintsCount: behaviorController.mandatoryExecutionConstraints.customConstraints.length
    }
  };
}

/**
 * 技術選択の検証
 */
async function handleValidateTechnologyChoice(
  args: { selectedTechnology: string; technologyType: keyof TechnologyConstraints },
  sessionManager: SessionManager
): Promise<any> {
  const { selectedTechnology, technologyType } = args;
  
  try {
    sessionManager.validateTechnologyChoice(selectedTechnology, technologyType);
    return {
      success: true,
      message: `Technology choice '${selectedTechnology}' is approved for ${technologyType}`,
      selectedTechnology,
      technologyType,
      approved: true
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      constraintViolation: true,
      constraintId: error.constraintId,
      resolutionSteps: error.resolutionSteps || [],
      severity: error.severity || 'high',
      selectedTechnology,
      technologyType,
      approved: false
    };
  }
}

/**
 * カスタム制約の追加
 */
async function handleAddCustomConstraint(
  args: { constraintRule: CustomConstraintRule },
  sessionManager: SessionManager
): Promise<any> {
  const { constraintRule } = args;
  
  const behaviorController = sessionManager.getBehaviorController();
  if (!behaviorController) {
    throw new Error('No behavior controller configured');
  }
  
  // 制約ルールの追加
  behaviorController.mandatoryExecutionConstraints.customConstraints.push(constraintRule);
  
  // 更新された制約設定を適用
  sessionManager.setBehaviorController(behaviorController);
  
  return {
    success: true,
    message: `Custom constraint '${constraintRule.name}' added successfully`,
    constraintId: constraintRule.id,
    constraintName: constraintRule.name,
    applicablePhases: constraintRule.applicablePhases,
    severity: constraintRule.severity
  };
}

/**
 * 現在の制約設定を取得
 */
async function handleGetConstraintConfiguration(
  args: { includeHistory?: boolean },
  sessionManager: SessionManager
): Promise<any> {
  const { includeHistory = false } = args;
  
  const behaviorController = sessionManager.getBehaviorController();
  if (!behaviorController) {
    return {
      success: false,
      error: 'No behavior controller configured'
    };
  }
  
  const result: any = {
    success: true,
    configuration: behaviorController,
    summary: {
      mandatoryConstraints: {
        enforceFileReadBeforeModification: behaviorController.mandatoryExecutionConstraints.enforceFileReadBeforeModification,
        enforcePhaseProgression: behaviorController.mandatoryExecutionConstraints.enforcePhaseProgression,
        enforceQualityValidation: behaviorController.mandatoryExecutionConstraints.enforceQualityValidation,
        customConstraintsCount: behaviorController.mandatoryExecutionConstraints.customConstraints.length
      },
      qualityAssurance: {
        standardsCount: Object.keys(behaviorController.qualityAssuranceConstraints.minimumQualityStandards).length,
        completenessChecksCount: behaviorController.qualityAssuranceConstraints.completenessChecks.length,
        consistencyChecksCount: behaviorController.qualityAssuranceConstraints.consistencyChecks.length,
        autoFixEnabled: behaviorController.qualityAssuranceConstraints.autoFixConfiguration.enabled
      },
      externalSystemControl: {
        allowedMCPToolsCount: behaviorController.externalSystemControl.allowedMCPTools.length,
        restrictedMCPToolsCount: behaviorController.externalSystemControl.restrictedMCPTools.length,
        allowedEndpointsCount: behaviorController.externalSystemControl.externalAPIControl.allowedEndpoints.length
      }
    }
  };
  
  if (includeHistory) {
    // 設定履歴の取得は将来の実装
    result.history = [];
  }
  
  return result;
}

/**
 * 制約設定をファイルから読み込み
 */
async function handleLoadConstraintConfiguration(
  args: { configFilePath: string },
  sessionManager: SessionManager
): Promise<any> {
  const { configFilePath } = args;
  
  try {
    // 実際の実装では、ConstraintConfigurationManagerを使用
    const fs = await import('fs');
    const configData = await fs.promises.readFile(configFilePath, 'utf8');
    const config = JSON.parse(configData) as LLMBehaviorController;
    
    sessionManager.setBehaviorController(config);
    
    return {
      success: true,
      message: `Constraint configuration loaded from ${configFilePath}`,
      configFilePath,
      configuration: config
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to load constraint configuration: ${error.message}`,
      configFilePath
    };
  }
}

/**
 * 制約設定をファイルに保存
 */
async function handleSaveConstraintConfiguration(
  args: { configFilePath: string },
  sessionManager: SessionManager
): Promise<any> {
  const { configFilePath } = args;
  
  try {
    const behaviorController = sessionManager.getBehaviorController();
    if (!behaviorController) {
      throw new Error('No behavior controller configured');
    }
    
    const fs = await import('fs');
    const configData = JSON.stringify(behaviorController, null, 2);
    await fs.promises.writeFile(configFilePath, configData, 'utf8');
    
    return {
      success: true,
      message: `Constraint configuration saved to ${configFilePath}`,
      configFilePath
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to save constraint configuration: ${error.message}`,
      configFilePath
    };
  }
}

/**
 * ドキュメント作成制約の作成
 */
function createDocumentCreationConstraints(_config: any): LLMBehaviorController {
  
  return {
    mandatoryExecutionConstraints: {
      enforceFileReadBeforeModification: true,
      enforcePhaseProgression: true,
      enforceQualityValidation: true,
      enforceExternalDependencyResolution: false,
      customConstraints: [
        {
          id: 'DOCUMENT_QUALITY_STANDARDS',
          name: 'Document Quality Standards',
          condition: 'documentType in ["api-spec", "sequence-diagram"]',
          violationMessage: 'Document does not meet quality standards',
          resolutionSteps: [
            'Add all required sections',
            'Include examples for each endpoint/message',
            'Specify parameters and return values',
            'Add error handling documentation'
          ],
          severity: 'high' as const,
          applicablePhases: ['WRITE_OR_REFACTOR', 'PRESENT'] as Phase[]
        }
      ]
    },
    qualityAssuranceConstraints: {
      minimumQualityStandards: {
        'completeness': 95,
        'exampleCoverage': 100,
        'parameterDocumentation': 100
      },
      completenessChecks: [],
      consistencyChecks: [],
      autoFixConfiguration: {
        enabled: true,
        fixableIssueTypes: ['missing-examples', 'incomplete-parameters'],
        maxFixAttempts: 3,
        revalidateAfterFix: true
      }
    },
    externalSystemControl: {
      allowedMCPTools: ['structured-workflow-mcp', 'filesystem', 'web-search'],
      restrictedMCPTools: [],
      externalAPIControl: {
        allowedEndpoints: [],
        apiKeyManagement: {
          encrypted: true,
          expiration: 86400000,
          rotation: false
        },
        rateLimits: {},
        timeouts: {}
      },
      fileSystemControl: {
        readablePaths: ['./docs', './src', './examples'],
        writablePaths: ['./docs', './output'],
        restrictedPaths: ['/etc', '/usr/bin'],
        preventPathTraversal: true
      }
    },
    dynamicConstraintConfiguration: {
      runtimeConstraintUpdates: true,
      learningBasedConstraints: false,
      contextDependentConstraints: [],
      userDefinedConstraints: []
    }
  };
}

/**
 * 技術制約の作成
 */
function createTechnologyConstraints(_config: any): LLMBehaviorController {
  
  return {
    mandatoryExecutionConstraints: {
      enforceFileReadBeforeModification: true,
      enforcePhaseProgression: true,
      enforceQualityValidation: true,
      enforceExternalDependencyResolution: true,
      customConstraints: [
        {
          id: 'TECHNOLOGY_APPROVAL',
          name: 'Technology Approval Constraint',
          condition: 'technology not in allowedList',
          violationMessage: 'Selected technology is not approved',
          resolutionSteps: [
            'Choose from approved technology list',
            'Request approval for new technology',
            'Update project constraints'
          ],
          severity: 'critical' as const,
          applicablePhases: ['PLANNING', 'WRITE_OR_REFACTOR'] as Phase[]
        }
      ]
    },
    qualityAssuranceConstraints: {
      minimumQualityStandards: {
        'technologyCompliance': 100,
        'architectureConsistency': 95
      },
      completenessChecks: [],
      consistencyChecks: [],
      autoFixConfiguration: {
        enabled: false,
        fixableIssueTypes: [],
        maxFixAttempts: 0,
        revalidateAfterFix: false
      }
    },
    externalSystemControl: {
      allowedMCPTools: ['structured-workflow-mcp', 'filesystem'],
      restrictedMCPTools: ['system-admin'],
      externalAPIControl: {
        allowedEndpoints: ['https://api.npmjs.org'],
        apiKeyManagement: {
          encrypted: true,
          expiration: 86400000,
          rotation: false
        },
        rateLimits: {},
        timeouts: {}
      },
      fileSystemControl: {
        readablePaths: ['./src', './package.json'],
        writablePaths: ['./src'],
        restrictedPaths: ['/etc', '/usr/bin'],
        preventPathTraversal: true
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
 * プロジェクト規約制約の作成
 */
function createProjectConventionsConstraints(_config: any): LLMBehaviorController {
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
          condition: 'true',
          violationMessage: 'Code does not meet project standards',
          resolutionSteps: [
            'Follow coding style guide',
            'Add proper documentation',
            'Implement error handling'
          ],
          severity: 'high' as const,
          applicablePhases: ['WRITE_OR_REFACTOR', 'LINT'] as Phase[]
        }
      ]
    },
    qualityAssuranceConstraints: {
      minimumQualityStandards: {
        'codeCompliance': 95,
        'testCoverage': 85,
        'documentationCoverage': 80
      },
      completenessChecks: [],
      consistencyChecks: [],
      autoFixConfiguration: {
        enabled: true,
        fixableIssueTypes: ['formatting', 'naming', 'comments'],
        maxFixAttempts: 3,
        revalidateAfterFix: true
      }
    },
    externalSystemControl: {
      allowedMCPTools: ['structured-workflow-mcp', 'filesystem'],
      restrictedMCPTools: [],
      externalAPIControl: {
        allowedEndpoints: [],
        apiKeyManagement: {
          encrypted: true,
          expiration: 86400000,
          rotation: false
        },
        rateLimits: {},
        timeouts: {}
      },
      fileSystemControl: {
        readablePaths: ['./src', './tests', './docs'],
        writablePaths: ['./src', './tests', './docs'],
        restrictedPaths: ['/etc', '/usr/bin', './config/secrets'],
        preventPathTraversal: true
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
 * コード品質制約の作成
 */
function createCodeQualityConstraints(config: any): LLMBehaviorController {
  const qualityMetrics = config.qualityMetrics || {};
  
  return {
    mandatoryExecutionConstraints: {
      enforceFileReadBeforeModification: true,
      enforcePhaseProgression: true,
      enforceQualityValidation: true,
      enforceExternalDependencyResolution: false,
      customConstraints: []
    },
    qualityAssuranceConstraints: {
      minimumQualityStandards: {
        'complexity': qualityMetrics.maxComplexity || 10,
        'testCoverage': qualityMetrics.minTestCoverage || 80,
        'maintainabilityIndex': qualityMetrics.minMaintainabilityIndex || 70
      },
      completenessChecks: [],
      consistencyChecks: [],
      autoFixConfiguration: {
        enabled: true,
        fixableIssueTypes: ['formatting', 'imports', 'documentation'],
        maxFixAttempts: 5,
        revalidateAfterFix: true
      }
    },
    externalSystemControl: {
      allowedMCPTools: ['structured-workflow-mcp', 'filesystem'],
      restrictedMCPTools: [],
      externalAPIControl: {
        allowedEndpoints: [],
        apiKeyManagement: {
          encrypted: true,
          expiration: 86400000,
          rotation: false
        },
        rateLimits: {},
        timeouts: {}
      },
      fileSystemControl: {
        readablePaths: ['./src', './tests'],
        writablePaths: ['./src', './tests'],
        restrictedPaths: ['/etc', '/usr/bin'],
        preventPathTraversal: true
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
 * セキュリティ・コンプライアンス制約の作成
 */
function createSecurityComplianceConstraints(config: any): LLMBehaviorController {
  const securityStandards = config.securityStandards || {};
  
  return {
    mandatoryExecutionConstraints: {
      enforceFileReadBeforeModification: true,
      enforcePhaseProgression: true,
      enforceQualityValidation: true,
      enforceExternalDependencyResolution: true,
      customConstraints: [
        {
          id: 'SECURITY_COMPLIANCE',
          name: 'Security Compliance Requirements',
          condition: 'true',
          violationMessage: 'Code does not meet security requirements',
          resolutionSteps: [
            'Remove hardcoded secrets',
            'Implement proper authentication',
            'Add input validation',
            'Use secure protocols'
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
      completenessChecks: [],
      consistencyChecks: [],
      autoFixConfiguration: {
        enabled: false,
        fixableIssueTypes: [],
        maxFixAttempts: 0,
        revalidateAfterFix: false
      }
    },
    externalSystemControl: {
      allowedMCPTools: ['structured-workflow-mcp', 'filesystem'],
      restrictedMCPTools: ['shell-access', 'system-admin', 'network-access'],
      externalAPIControl: {
        allowedEndpoints: [],
        apiKeyManagement: {
          encrypted: true,
          expiration: 86400000,
          rotation: true
        },
        rateLimits: {},
        timeouts: {}
      },
      fileSystemControl: {
        readablePaths: ['./src', './tests'],
        writablePaths: ['./src', './tests'],
        restrictedPaths: ['/etc', '/usr/bin', './secrets', './keys', './.env'],
        preventPathTraversal: true
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