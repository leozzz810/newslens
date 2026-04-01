# Privacy Policy for NewsLens

**Last updated: April 1, 2026**

**Developer: leozzz810**

---

## Overview

NewsLens is a Chrome extension that provides a personalized AI-powered news dashboard with summaries, daily briefings, and Q&A. We are committed to protecting your privacy.

---

## Information We Collect

### Information We Do NOT Collect

- We do not collect any personally identifiable information (PII)
- We do not track your browsing history or activity
- We do not sell or share your data with third parties
- We do not use cookies for tracking purposes
- We do not require account registration

### Information Stored Locally

The following data is stored **only in your browser** using Chrome's local storage (`chrome.storage.local`):

- Your bookmarked news articles
- Your reading history and streak statistics
- Your preference settings (language, theme, categories)
- Cached news content to reduce network requests

This data never leaves your device except as described below.

### Information Sent to Our Server

- **News browsing:** The extension fetches news from our Cloudflare Worker API (`newslens-api.newslens.workers.dev`). No personal identifiers are sent — only standard HTTP headers (IP address, user agent) handled by Cloudflare.
- **AI Q&A feature:** When you submit a question, the text of your query is sent to our backend API to generate a response using the Anthropic Claude AI model. We do not log or store these queries beyond the scope of fulfilling the request.
- **Daily Briefing:** Briefing content is pre-generated server-side via scheduled tasks and served to all users identically. No personal data is involved.

---

## How We Use Information

- News content is fetched from public RSS feeds (TechNews, iThome, ETtoday, BBC, Reuters, etc.) and processed by AI to generate summaries
- AI summaries and scores are computed via our Cloudflare Worker backend using Anthropic Claude
- All user preferences and reading history are stored locally on your device only
- No behavioral data is collected or analyzed for advertising purposes

---

## Third-Party Services

NewsLens uses the following third-party services:

| Service | Purpose |
|---------|---------|
| **Cloudflare Workers & D1** | Backend API, database hosting |
| **Cloudflare KV** | Server-side caching |
| **Anthropic Claude API** | AI news summarization and Q&A |
| **Public RSS Feeds** | News content sources (TechNews, iThome, ETtoday, BBC, Reuters, TechCrunch, Ars Technica, WSJ, Hacker News, 女人迷, The Guardian, Lifehacker, etc.) |

Please refer to each provider's privacy policy for how they handle data:
- [Cloudflare Privacy Policy](https://www.cloudflare.com/privacypolicy/)
- [Anthropic Privacy Policy](https://www.anthropic.com/privacy)

---

## Data Retention

- **Local data** (bookmarks, reading stats, settings) remains on your device until you uninstall the extension, clear browser data, or use the "Clear Local Data" option in the extension settings
- **Server-side:** News articles are automatically deleted from our database after **30 days**. Daily briefings are deleted after **7 days**. We do not retain any personal data on our servers

---

## Permissions Used

The extension requests the following Chrome permissions:

| Permission | Reason |
|------------|--------|
| `storage` | Save bookmarks, preferences, and cached news locally |
| `alarms` | Schedule background news refresh |
| `host_permissions` (newslens-api.newslens.workers.dev) | Fetch news and AI summaries from our API |

---

## Children's Privacy

NewsLens is not directed at children under the age of 13. We do not knowingly collect information from children.

---

## Changes to This Policy

We may update this Privacy Policy from time to time. Any changes will be reflected by updating the "Last updated" date above. Continued use of the extension after changes constitutes acceptance of the updated policy.

---

## Contact Us

If you have any questions about this Privacy Policy, please contact us at:

- GitHub: [https://github.com/leozzz810](https://github.com/leozzz810)
- Repository: [https://github.com/leozzz810/newslens](https://github.com/leozzz810/newslens)
