# Firebase Authentication

We'll be working on adding firebase authentication, and though its the easiest form of Social Auth you can find on the web, after upgrading my app from "firebase": "^8.8.0" and "firebase-admin": "^9.11.0" to "firebase": "^9.6.5" and "firebase-admin": "^10.0.2" respectively, It took me a while to get things up and running. So this repo will serve as an easy way of skipping the long process and giving you time to focus on the useful part of your app. A live preview can be found [here](firebase9auth.vercel.app) and complete tutorial [here on Medium](https://viewcrunch.medium.com/a-practical-example-using-mongodb-atlas-search-144ab2d4ed78)

## Prerequisite

A basic understanding of the following is required to fully understand what we'll be doing here, and to get the most from this tutorial, I'll suggest you spend some time getting familiar with the following topics:

1. Javascript
2. Node.js
3. Next.js (better still React.js can help)
4. Fetcher
5. Firebase || Firestore

### Running the app

1. `git clone https://github.com/viewcrunch/NextJs-starter-template.git .` // clone my Next.js starter repo
2. `npm i` // install all packages in package.json in the root folder
3. `npm run dev` // start development server locally
4. `git remote set-url origin https://github.com/viewcrunch/Firebase-Auth.git` // update origin url to your current repo
