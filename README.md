
  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.



  ###########

  # Proxy API requests to backend

    location /api/ {

        proxy_pass http://10.201.8.208:8080;

        proxy_set_header Host $host;

        proxy_set_header X-Real-IP $remote_addr;

        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    }
