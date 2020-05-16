# build docker image 

FROM python:3.8

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# set environment variables for python optimization
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install psycopg2 dependencies that don't come in alpine (which pipenv needs)
# RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev

# install dependencies
RUN pip install pipenv
COPY ./Pipfile ./

# install the rest of packages
RUN pipenv lock
RUN pipenv sync

# copy project
COPY . .

RUN apt-get -y update && apt-get -y install netcat

# run entrypoint.sh to start server and any other necessary entrypoint operations
ENTRYPOINT ["./docker-entrypoint.sh"]