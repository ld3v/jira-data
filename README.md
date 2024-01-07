# Jira Integrate

Just an application, which allows you get your team's data and visualize it on the website.

For this application, I am trying to create a tool, which allows me follow team's status, logwork time, task progress.

## Follow these command to start your own!

- `npm install` - Install dependencies packages
- `cp .env.example .env` - Initial `.env` file. **Read the note before continue!**
- `npm run dev` - Run app in Development mode
- `npm run start` - Run app in Production mode

## NOTE!

> Please note that this application don't save anything about you, in case you enter your org's domain, username & access token (or password), the application will encrypted it and send back to you! This encrypted token will be save on your browser only. (Cookies)
>
> For more information, you can check the logic about it in 2 files `/api/me.ts` or `/utils/security.ts`.

> Please replace with a new `CIPHER_IV` & `CIPHER_SECRET` to protect your app, you can create it with send a new request `[GET] - /api/random-cipher` and check server's logs.
