# picshare
easy mobile photo upload for desktop forms

*goal*

i'm tried of airdropping insurance and id photos to my laptop when filling out a form. please copy this code to your shitty online doctor app and save us our sanity.

this project doesn't have the cleanest code, more of a proof of concept for the UI and learning how to auto deploy a project with github actions.


*how to run*

first you'll need to setup an ngrok account. check the docs here: https://ngrok.com/docs/ngrok-agent/config/ for info on setting up multiple tunnels. you will need three:
- http 3000: nextjs app / frontend
- http 8080: express api
- http 8081: websockets endpoint (ngrok http tunnels support ws)


# live deployment
https://picshare-pedelen.vercel.app/

*aws config*

- running on ECS, auto builds docker container for express api and deploys image to cluster on push
- EC2 load balancer routes traffic to service, healthcheck endpoint is /healthcheck
- Route53 handles subdomain pointing, ACM generates cert for SSL, required for websockets
- Vercel auto deploys nextjs FE on push

