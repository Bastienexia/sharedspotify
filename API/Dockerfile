FROM python:3.10-bullseye

RUN apt-get update -yq \
&& apt-get upgrade -yq \
&& apt-get install redis -yq 

COPY . .

RUN pip3 install -r requirements.txt

EXPOSE 8000

RUN chmod +x startup.sh

CMD ./startup.sh