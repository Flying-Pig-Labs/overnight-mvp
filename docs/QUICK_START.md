# ⚡ Quick Start Guide

## 🚀 30-Second Setup

```bash
npm install && make build && make setup-aws
```

## 💡 Build Your First MVP

### 1. Describe Your Idea (2 min)
```bash
make chat
```
Tell the AI what you want to build. Be specific about features.

### 2. Generate Frontend (5 min)
```bash
make frontend
```
Interactive design session → Copy prompt → Paste into [lovable.dev](https://lovable.dev)

### 3. Generate Backend (5 min)
```bash
make backend
```
Copy the prompt → Paste into Amazon Q Developer → Deploy backend

### 4. Connect & Deploy (5 min)
```bash
make integration
```
Copy the prompt → Paste into Claude Code → Connect frontend to backend & deploy

## 🎉 Done!

Your app is live at `https://your-app.cloudfront.net`

---

### 🔥 Pro Tips

- **Be specific** in chat - "task tracker with projects, deadlines, and team assignments"
- **Use examples** - "like Trello but simpler"
- **Start small** - You can always add features later

### 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| AWS credentials error | Run `aws configure --profile personal` |
| Bedrock access denied | Check IAM permissions for Claude |
| Build fails | Run `npm install` then `make clean build` |

### 📚 Next Steps

- Read [CLI Reference](CLI_REFERENCE.md) for all commands
- Check [example-mvp-spec.yaml](../templates/example-mvp-spec.yaml) for inspiration
- Join our [Discord](https://discord.gg/overnight-mvp) for help