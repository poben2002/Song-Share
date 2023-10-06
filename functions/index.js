/**
 * Firebase cloud functions.
 * This is a cloud function to support openAI API call.
 * 
 * This document and YouTube video can be helpful for start.
 * https://firebase.google.com/docs/functions
 * https://www.youtube.com/watch?v=DYfP-UIKxH0&list=PLl-K7zZEsYLkPZHe41m4jfAxUi0JjLgSM
 * 
 * To note for later usage, I needed to do the following additional measures to use Firebase Functions.
 * 1) Turn on Artifact Registry API as well here.
 *    https://console.cloud.google.com/flows/enableapi?apiid=artifactregistry.googleapis.com
 * 2) Grant a permission to call Cloud functions.
 *    https://stackoverflow.com/a/58776066
 * 3) If the permission still doesn't work, you need to delete the function and redeploy it.
 * 4) If you have an CORS issue in your localhost, you should make sure the function is for allUsers
 *    https://stackoverflow.com/a/60983957
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: "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",
});

// Gen1 function example. It should be called with httpsCallable();
// Note that gen1 function name should not have underscore or capital letters.
// https://lust.dev/2022/08/04/upgrading-cloud-functions-gen2/
exports.analysis = functions.https.onCall(async (data, context) => {
    // OpenAI API call for playlist analysis.
    const playList = JSON.stringify(data.playList, null, 2);
    const prompt = "The following information is song information in a playlist."
        + "\n\n"
        + playList
        + "\n\n"
        + "Analyze the information based on the song, artist, and features, and give me an insight into my favorite music style."
        + "Explain in words rather than numbers. Do not show any decimal number or percentage in the result. Do not exceed 1 paragraph."
        + "Skip introduction, such as 'based on ...', and explain like 'your favorite style is...'";

    const openai = new OpenAIApi(configuration);
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0,
        frequency_penalty: 0,
        presence_penalty: 0,
        messages: [{
            role: "user",
            content: prompt,
        }],
    });

    return (completion.data);
});

// Gen2 function example. It should be called with fetch() and also can be called https protocol.
// We don't use it for now, but left it for study later
exports.playlistAnalysis = onRequest((request, response) => {
    logger.info("Function called", { structuredData: true });

    // For localhost test to avoid CORS policy
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "GET,HEAD,POST");
    response.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    // Make a response. It should be a JSON type.
    const result = {
        "status": "success",
        "data": "Under the development..."
    }

    response.send(result);
});
