#! /bin/bash

node www/data/server.js  & node www/data/api.js & ionic emulate browser && fg
