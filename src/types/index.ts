export interface MVPSpecification {
  name: string;
  description: string;
  features: string[];
  userStories: string[];
  frontend: {
    pages: string[];
    components: string[];
    styling: {
      theme?: string;
      primaryColor?: string;
      framework?: string;
    };
  };
  backend: {
    apis: APIEndpoint[];
    dataModels: DataModel[];
    integrations: string[];
  };
  deployment: {
    hosting: string;
    domain?: string;
    scaling: {
      initial: string;
      target?: string;
    };
  };
}

export interface APIEndpoint {
  path: string;
  method: string;
  description: string;
  requestBody?: any;
  responseBody?: any;
}

export interface DataModel {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
}

export interface FrontendAnalysis {
  apiCalls: Array<{
    endpoint: string;
    method: string;
    usage: string;
    component: string;
  }>;
  stateManagement: {
    globalState: any;
    localState: any;
  };
  authentication: {
    required: boolean;
    methods: string[];
  };
  dataFlow: any;
}

export interface BackendSpecification {
  apis: APIEndpoint[];
  database: {
    type: string;
    tables: DataModel[];
  };
  authentication: {
    provider: string;
    configuration: any;
  };
  infrastructure: {
    compute: string;
    storage: string;
    cdn: boolean;
  };
}

export interface WorkflowState {
  mvpSpec: MVPSpecification;
  frontendPath?: string;
  frontendAnalysis?: FrontendAnalysis;
  backendSpec?: BackendSpecification;
  backendPath?: string;
  deploymentInfo?: {
    frontendUrl?: string;
    apiUrl?: string;
    cdnUrl?: string;
  };
}