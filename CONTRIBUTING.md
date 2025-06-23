# Contributing to Overnight MVP

Thank you for your interest in contributing to Overnight MVP! This guide will help you understand the project structure and contribution process.

## Development Process

### MVP Specification Review Process

When the `make mvp` command generates an `mvpspec.yml` file, it's crucial that users review and modify this file before proceeding. The AI-generated specification is a starting point that often needs refinement.

**Key Review Points:**
- Feature completeness and accuracy
- Data model relationships and field types
- API endpoint definitions and REST conventions
- Technical requirements and constraints
- UI/UX requirements alignment with vision

### Code Contributions

1. **Fork the repository** and create your feature branch
2. **Make your changes** following the existing code style
3. **Test thoroughly** - ensure all commands work as expected
4. **Submit a Pull Request** with a clear description

### Testing Guidelines

Before submitting a PR:
```bash
# Build the project
make build

# Test the CLI commands
make example  # Generate example project
make mvp      # Test MVP generation
```

### Code Style

- TypeScript with strict mode enabled
- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing patterns in the codebase

### Prompt Engineering

When modifying AI prompts:
- Keep prompts clear and specific
- Test with multiple scenarios
- Ensure generated specs follow the YAML template structure
- Include validation rules in prompts

## Issue Reporting

When reporting issues:
1. Check existing issues first
2. Include your environment details (Node version, OS)
3. Provide steps to reproduce
4. Include relevant error messages or logs

## Feature Requests

We welcome feature suggestions! Please:
- Explain the use case clearly
- Describe the expected behavior
- Consider how it fits with the project's goals

## Questions?

Feel free to open an issue for any questions about contributing.