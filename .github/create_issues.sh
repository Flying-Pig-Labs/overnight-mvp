#!/bin/bash

# Script to create GitHub issues for MVP Deployment System testing
# Requires GitHub CLI (gh) to be installed and authenticated

echo "🚀 Creating GitHub Issues for MVP Deployment System Testing"
echo "============================================================"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "Please run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is ready"
echo ""

# Create Issue #1: Set up Basic CDK Environment
echo "Creating Issue #1: Set up Basic CDK Environment"
gh issue create \
  --title "Set up Basic CDK Environment" \
  --body "## Description
Set up minimal CDK environment to test our deployment flow.

## Tasks
- [ ] Install AWS CDK CLI
- [ ] Create basic project structure
- [ ] Test \`cdk synth\` command
- [ ] Document any setup issues

## Acceptance Criteria
- CDK CLI works
- Can run basic commands
- Documented setup process

## Estimated Time
1 hour" \
  --label "testing,setup,priority-high"

# Create Issue #2: Test Lovable.dev Frontend Generation
echo "Creating Issue #2: Test Lovable.dev Frontend Generation"
gh issue create \
  --title "Test Lovable.dev Frontend Generation" \
  --body "## Description
Test Lovable.dev with our FrontSpec prompts and document results.

## Tasks
- [ ] Use \`2-frontspec-template.yaml\` as base
- [ ] Generate 3 different frontend ideas
- [ ] Test with Lovable.dev
- [ ] Document quality, speed, and issues
- [ ] Compare different prompt variations

## Acceptance Criteria
- 3 working frontends generated
- Documented results and learnings
- Identified best prompt patterns

## Estimated Time
2 hours" \
  --label "testing,frontend,priority-high"

# Create Issue #3: Test AWS Q CLI Backend Generation
echo "Creating Issue #3: Test AWS Q CLI Backend Generation"
gh issue create \
  --title "Test AWS Q CLI Backend Generation" \
  --body "## Description
Test AWS Q Developer CLI for backend generation and document results.

## Tasks
- [ ] Install AWS Q Developer CLI
- [ ] Create simple backend-spec.json
- [ ] Test Q CLI with natural language prompts
- [ ] Document generation quality and speed
- [ ] Test with different complexity levels

## Acceptance Criteria
- Q CLI generates working backends
- Documented results and limitations
- Identified optimal prompt patterns

## Estimated Time
2 hours" \
  --label "testing,backend,priority-high"

# Create Issue #4: Test Frontend Analysis Tools
echo "Creating Issue #4: Test Frontend Analysis Tools"
gh issue create \
  --title "Test Frontend Analysis Tools" \
  --body "## Description
Test automated frontend analysis and FrontSpec generation.

## Tasks
- [ ] Use generated Lovable.dev frontends
- [ ] Test manual analysis vs automated tools
- [ ] Document what can/cannot be automated
- [ ] Test with different React patterns
- [ ] Compare analysis accuracy

## Acceptance Criteria
- Analysis tools tested on real frontends
- Documented automation capabilities
- Identified manual intervention needs

## Estimated Time
3 hours" \
  --label "testing,analysis,priority-medium"

# Create Issue #5: Test End-to-End Flow
echo "Creating Issue #5: Test End-to-End Flow"
gh issue create \
  --title "Test End-to-End Flow" \
  --body "## Description
Test complete flow from idea to deployed MVP.

## Tasks
- [ ] Start with simple MVP idea
- [ ] Generate frontend with Lovable.dev
- [ ] Generate backend with Q CLI
- [ ] Deploy both to AWS
- [ ] Document total time and issues
- [ ] Test with different MVP types

## Acceptance Criteria
- Complete MVP deployed successfully
- Documented total time and process
- Identified bottlenecks and improvements

## Estimated Time
4 hours" \
  --label "testing,integration,priority-high"

# Create Issue #6: Compare AI Tools and Models
echo "Creating Issue #6: Compare AI Tools and Models"
gh issue create \
  --title "Compare AI Tools and Models" \
  --body "## Description
Test different AI tools and models for each step of the flow.

## Tasks
- [ ] Test different LLMs for FrontSpec generation
- [ ] Compare Lovable.dev vs other frontend generators
- [ ] Test Q CLI vs manual backend creation
- [ ] Document pros/cons of each tool
- [ ] Identify optimal tool combinations

## Acceptance Criteria
- Multiple tools tested for each step
- Documented comparisons and recommendations
- Identified best tool stack

## Estimated Time
6 hours" \
  --label "research,ai-tools,priority-medium"

# Create Issue #7: Document Success Metrics
echo "Creating Issue #7: Document Success Metrics"
gh issue create \
  --title "Document Success Metrics" \
  --body "## Description
Define and measure success metrics for the MVP deployment system.

## Tasks
- [ ] Define key metrics (time, quality, cost)
- [ ] Create measurement framework
- [ ] Test with sample MVPs
- [ ] Document baseline performance
- [ ] Identify improvement targets

## Acceptance Criteria
- Clear success metrics defined
- Baseline measurements documented
- Improvement targets set

## Estimated Time
2 hours" \
  --label "documentation,metrics,priority-medium"

# Create Issue #8: Create Testing Framework
echo "Creating Issue #8: Create Testing Framework"
gh issue create \
  --title "Create Testing Framework" \
  --body "## Description
Create repeatable testing framework for the deployment flow.

## Tasks
- [ ] Define test scenarios
- [ ] Create test data sets
- [ ] Build automated test scripts
- [ ] Document test procedures
- [ ] Create test reporting

## Acceptance Criteria
- Repeatable test framework
- Automated test scripts
- Clear test documentation

## Estimated Time
4 hours" \
  --label "testing,framework,priority-low"

# Create Issue #9: Document Lessons Learned
echo "Creating Issue #9: Document Lessons Learned"
gh issue create \
  --title "Document Lessons Learned" \
  --body "## Description
Document all lessons learned and recommendations.

## Tasks
- [ ] Compile all test results
- [ ] Document what works well
- [ ] Document what doesn't work
- [ ] Create recommendations
- [ ] Identify next steps

## Acceptance Criteria
- Comprehensive lessons learned document
- Clear recommendations
- Actionable next steps

## Estimated Time
3 hours" \
  --label "documentation,lessons,priority-medium"

# Create Issue #10: Create Demo MVP
echo "Creating Issue #10: Create Demo MVP"
gh issue create \
  --title "Create Demo MVP" \
  --body "## Description
Create a showcase MVP to demonstrate the system capabilities.

## Tasks
- [ ] Choose interesting MVP idea
- [ ] Follow complete deployment flow
- [ ] Create demo documentation
- [ ] Record demo video
- [ ] Prepare presentation materials

## Acceptance Criteria
- Working demo MVP
- Clear documentation
- Demo video and materials

## Estimated Time
4 hours" \
  --label "demo,showcase,priority-low"

echo ""
echo "============================================================"
echo "🎉 Successfully created 10 issues!"
echo ""
echo "📝 Next steps:"
echo "1. Review the created issues in your GitHub repository"
echo "2. Assign issues to team members"
echo "3. Start working on the high-priority issues first"
echo "4. Use the test report templates for documenting results" 