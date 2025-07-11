export type Phase = 
  | 'PLANNING'
  | 'SETUP'
  | 'AUDIT_INVENTORY'
  | 'COMPARE_ANALYZE'
  | 'QUESTION_DETERMINE'
  | 'WRITE_OR_REFACTOR'
  | 'TEST'
  | 'LINT'
  | 'ITERATE'
  | 'PRESENT'
  | 'USER_INPUT_REQUIRED';

export interface FileHistory {
  hasBeenRead: boolean;
  hasBeenModified: boolean;
  firstReadAt?: number;
  lastModifiedAt?: number;
}

export interface WorkflowMetrics {
  filesAnalyzed: number;
  filesModified: number;
  lintIssuesFound: number;
  lintIssuesFixed: number;
  phasesCompleted: number;
  totalDuration?: number;
  // Phase 2: 確率的応答問題克服システム メトリクス
  qualityImprovements?: number;
  responseControls?: number;
}

export interface PhaseOutput {
  phase: Phase;
  completedAt: number;
  duration: number;
  output: any;
}

export interface SessionState {
  id: string;
  taskDescription: string;
  startedAt: number;
  currentPhase: Phase;
  completedPhases: Phase[];
  phaseOutputs: Map<Phase, PhaseOutput>;
  fileHistory: Map<string, FileHistory>;
  metrics: WorkflowMetrics;
  workflowConfig?: WorkflowConfiguration;
  iterationCounts: Map<Phase, number>;
  validationStates: Map<Phase, ValidationState>;
  workflowType?: 'refactor' | 'feature' | 'test' | 'tdd';
}

export interface ToolContext {
  startDate: string;
  sessionId?: string;
}

export interface ValidationResult {
  allowed: boolean;
  error?: string;
  reason?: string;
  resolution?: string;
  currentPhase?: Phase;
  reminder?: string;
}

export interface PhaseGuidance {
  phase: Phase;
  objective: string;
  instructions: string[];
  suggestedApproach?: string[];
  importantNotes?: string[];
  expectedOutput: Record<string, string>;
  nextPhase?: string;
  prerequisites?: {
    completed: Phase[];
    warning?: string | null;
  };
  bestPractices?: string[];
  validationCriteria?: ValidationCriteria;
  requiredOutputFiles?: OutputFileInstruction[];
  blockingMessages?: string[];
  directiveInstructions?: string[];
}

export interface WorkflowConfiguration {
  selectedPhases: Phase[];
  iterationLimits: IterationLimits;
  outputPreferences: OutputPreferences;
  userCheckpoints: UserCheckpointConfig;
  escalationTriggers: EscalationConfig;
}

export interface IterationLimits {
  TEST: number;
  LINT: number;
  ITERATE: number;
  maxTotalDuration?: string;
  maxPhaseAttempts?: number;
}

export interface OutputPreferences {
  formats: ('markdown' | 'json')[];
  realTimeUpdates: boolean;
  generateDiagrams: boolean;
  includeCodeSnippets: boolean;
  outputDirectory: string;
  createProgressReport: boolean;
  createPhaseArtifacts: boolean;
}

export interface UserCheckpointConfig {
  beforeMajorChanges: boolean;
  afterFailedIterations: boolean;
  beforeFinalPresentation: boolean;
  customCheckpoints?: Phase[];
}

export interface EscalationConfig {
  enableUserInput: boolean;
  escalateOnIterationLimit: boolean;
  escalateOnErrors: boolean;
  escalateOnTime: boolean;
}

export interface ValidationCriteria {
  minimumRequirements: Record<string, number | string | boolean>;
  blockingMessages: string[];
  expectedFiles: string[];
  selfCheckQuestions: string[];
  completionCriteria: string[];
  cannotProceedUntil: string[];
}

export interface ValidationState {
  isComplete: boolean;
  completedRequirements: string[];
  failedRequirements: string[];
  lastValidatedAt: number;
  attempts: number;
}

export interface OutputFileInstruction {
  path: string;
  description: string;
  required: boolean;
  format: 'markdown' | 'json' | 'text';
  template?: string;
  validationRules?: string[];
}

export interface EscalationContext {
  trigger: 'iteration_limit' | 'user_checkpoint' | 'validation_failure' | 'time_limit';
  failedPhase: Phase;
  attemptCount: number;
  lastError?: string;
  options: string[];
  context: Record<string, any>;
}

// === LLM確率的応答問題克服システム - 物理的制約メカニズム ===

/**
 * LLMの動作を物理的に制約するコントローラー
 * プロンプトではなく、MCPツールレベルで強制的に制御
 */
export interface LLMBehaviorController {
  /** 必須実行制約 - 指定された条件を満たすまで次の動作を物理的にブロック */
  mandatoryExecutionConstraints: MandatoryExecutionConstraints;
  
  /** 品質保証制約 - 成果物の品質基準を満たすまで進行をブロック */
  qualityAssuranceConstraints: QualityAssuranceConstraints;
  
  /** 外部システム制御 - 他のMCPツールや外部システムの利用を制御 */
  externalSystemControl: ExternalSystemControl;
  
  /** 動的制約設定 - 実行時に制約ルールを動的に変更 */
  dynamicConstraintConfiguration: DynamicConstraintConfiguration;
}

/**
 * 必須実行制約の定義
 */
export interface MandatoryExecutionConstraints {
  /** ファイル読み込み強制 - 修正前の必須読み込み */
  enforceFileReadBeforeModification: boolean;
  
  /** フェーズ順序強制 - 指定されたフェーズ順序の厳格な遵守 */
  enforcePhaseProgression: boolean;
  
  /** 品質検証強制 - 各フェーズでの品質基準クリア */
  enforceQualityValidation: boolean;
  
  /** 外部依存解決強制 - 外部システムとの連携完了 */
  enforceExternalDependencyResolution: boolean;
  
  /** カスタム制約 - ユースケース固有の制約ルール */
  customConstraints: CustomConstraintRule[];
}

/**
 * 品質保証制約の定義
 */
export interface QualityAssuranceConstraints {
  /** 最小品質基準 - 下回った場合は強制的にリトライ */
  minimumQualityStandards: Record<string, number | string | boolean>;
  
  /** 完全性チェック - 必須要素の存在確認 */
  completenessChecks: CompletenessRule[];
  
  /** 一貫性チェック - データやコードの整合性確認 */
  consistencyChecks: ConsistencyRule[];
  
  /** 自動修正設定 - 基準未達時の自動修正ルール */
  autoFixConfiguration: AutoFixConfiguration;
}

/**
 * 外部システム制御の定義
 */
export interface ExternalSystemControl {
  /** 許可されたMCPツール - ホワイトリスト形式 */
  allowedMCPTools: string[];
  
  /** 制限されたMCPツール - ブラックリスト形式 */
  restrictedMCPTools: string[];
  
  /** 外部API制御 - 利用可能なAPIエンドポイント */
  externalAPIControl: ExternalAPIControl;
  
  /** ファイルシステム制御 - アクセス可能なパスの制限 */
  fileSystemControl: FileSystemControl;
}

/**
 * 動的制約設定の定義
 */
export interface DynamicConstraintConfiguration {
  /** 実行時制約更新 - 実行中の制約ルール変更 */
  runtimeConstraintUpdates: boolean;
  
  /** 学習ベース制約 - 過去の失敗から制約を自動強化 */
  learningBasedConstraints: boolean;
  
  /** コンテキスト依存制約 - プロジェクト特性に応じた制約 */
  contextDependentConstraints: ContextDependentConstraint[];
  
  /** ユーザー定義制約 - 設定ファイルによる制約カスタマイズ */
  userDefinedConstraints: UserDefinedConstraint[];
}

/**
 * カスタム制約ルールの定義
 */
export interface CustomConstraintRule {
  /** 制約ID - 一意識別子 */
  id: string;
  
  /** 制約名 - 人間可読な名前 */
  name: string;
  
  /** 制約条件 - 評価される条件式 */
  condition: string;
  
  /** 違反時メッセージ - 制約違反時のエラーメッセージ */
  violationMessage: string;
  
  /** 解決方法 - 制約違反の解決手順 */
  resolutionSteps: string[];
  
  /** 制約の重要度 - critical, high, medium, low */
  severity: 'critical' | 'high' | 'medium' | 'low';
  
  /** 適用フェーズ - 制約が適用されるフェーズ */
  applicablePhases: Phase[];
}

/**
 * 完全性チェックルールの定義
 */
export interface CompletenessRule {
  /** ルールID */
  id: string;
  
  /** チェック対象 */
  target: string;
  
  /** 必須要素リスト */
  requiredElements: string[];
  
  /** チェック条件 */
  checkCondition: string;
  
  /** 不完全時のメッセージ */
  incompleteMessage: string;
}

/**
 * 一貫性チェックルールの定義
 */
export interface ConsistencyRule {
  /** ルールID */
  id: string;
  
  /** チェック対象のペア */
  targetPair: [string, string];
  
  /** 一貫性条件 */
  consistencyCondition: string;
  
  /** 不整合時のメッセージ */
  inconsistentMessage: string;
}

/**
 * 自動修正設定の定義
 */
export interface AutoFixConfiguration {
  /** 自動修正の有効化 */
  enabled: boolean;
  
  /** 修正可能な問題タイプ */
  fixableIssueTypes: string[];
  
  /** 修正試行回数の上限 */
  maxFixAttempts: number;
  
  /** 修正後の再検証 */
  revalidateAfterFix: boolean;
}

/**
 * 外部API制御の定義
 */
export interface ExternalAPIControl {
  /** 許可されたAPIエンドポイント */
  allowedEndpoints: string[];
  
  /** APIキー管理 */
  apiKeyManagement: APIKeyManagement;
  
  /** レート制限 */
  rateLimits: Record<string, number>;
  
  /** タイムアウト設定 */
  timeouts: Record<string, number>;
}

/**
 * ファイルシステム制御の定義
 */
export interface FileSystemControl {
  /** 読み取り可能なパス */
  readablePaths: string[];
  
  /** 書き込み可能なパス */
  writablePaths: string[];
  
  /** 制限されたパス */
  restrictedPaths: string[];
  
  /** パストラバーサル防止 */
  preventPathTraversal: boolean;
}

/**
 * APIキー管理の定義
 */
export interface APIKeyManagement {
  /** 暗号化の有効化 */
  encrypted: boolean;
  
  /** キーの有効期限 */
  expiration: number;
  
  /** キーのローテーション */
  rotation: boolean;
}

/**
 * コンテキスト依存制約の定義
 */
export interface ContextDependentConstraint {
  /** 制約ID */
  id: string;
  
  /** 適用条件 */
  applicableWhen: string;
  
  /** 制約ルール */
  constraintRule: CustomConstraintRule;
  
  /** 動的パラメータ */
  dynamicParameters: Record<string, any>;
}

/**
 * ユーザー定義制約の定義
 */
export interface UserDefinedConstraint {
  /** 制約ID */
  id: string;
  
  /** 設定ファイルパス */
  configFilePath: string;
  
  /** 制約スキーマ */
  schema: any;
  
  /** 有効化フラグ */
  enabled: boolean;
}

/**
 * 技術選択制約の定義 - UC2対応
 */
export interface TechnologyConstraints {
  /** 許可されたフレームワーク */
  allowedFrameworks: string[];
  
  /** 許可されたデータベース */
  allowedDatabases: string[];
  
  /** 許可されたクラウドサービス */
  allowedCloudServices: string[];
  
  /** 禁止されたパターン */
  prohibitedPatterns: string[];
  
  /** 必須パターン */
  mandatoryPatterns: string[];
}

/**
 * 制約違反エラーの定義
 */
export interface ConstraintViolationError extends Error {
  /** 制約ID */
  constraintId: string;
  
  /** 違反詳細 */
  violationDetails: Record<string, any>;
  
  /** 解決手順 */
  resolutionSteps: string[];
  
  /** 重要度 */
  severity: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * 制約違反情報（学習システム用）
 */
export interface ConstraintViolation {
  /** 違反ID */
  violationId: string;
  
  /** 違反した制約 */
  violatedConstraint: string;
  
  /** 違反詳細 */
  violationDetails: Record<string, any>;
  
  /** 発生時刻 */
  occurredAt: number;
  
  /** 深刻度 */
  severity: 'critical' | 'high' | 'medium' | 'low';
  
  /** 解決済みフラグ */
  resolved: boolean;
}