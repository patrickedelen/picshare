# picshare
easy mobile photo upload for desktop forms

*goal*
i'm tried of airdropping insurance and id photos to my laptop when filling out a form. please copy this code to your shitty online doctor app and save us our sanity.

*how to run*
first you'll need to setup an ngrok account. check the docs here: https://ngrok.com/docs/ngrok-agent/config/ for info on setting up multiple tunnels. you will need three:
- http 3000: nextjs app / frontend
- http 8080: express api
- http 8081: websockets endpoint (ngrok http tunnels support ws)


