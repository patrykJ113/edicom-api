#!/bin/sh
npx prisma generate
npx cross-env NODE_ENV=development nodemon -r tsconfig-paths/register src/server.ts
