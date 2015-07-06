
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /* if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.6e967ead-01bb-4db4-a2d7-d6621b140007") {
             context.fail("Invalid Application ID");
        } */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                        context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        }  else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                     event.session,
                     function callback(sessionAttributes, speechletResponse) {
                         context.succeed(buildResponse(sessionAttributes, speechletResponse));
                     });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
                + ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
                + ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
                + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("MakeCocktail" === intentName) {
        console.log("Received MakeCocktail intent");
        console.log(JSON.stringify(intentRequest));
        startCocktail(intent, session, callback);
    } else if ("HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
                + ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Bartender";
    var speechOutput = "Welcome to the bartender. What would you like to mix?";
    var repromptText = "Please ask for the recipe of your favorite drink. "
                + "You could say: give me the recipe for a Negroni";
    var shouldEndSession = false;

    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function startCocktail(intent, session, callback) {
    var cardTitle = intent.name;
    var cocktailName = intent.slots.CocktailName.value;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;

    speechOutput = getBriefDescription(cocktailName);

    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}
function getBriefDescription(cocktailName) {
  var speechOutput = "";

  var cocktail = fuse.search(cocktailName)[0];
  if (typeof cocktail != "undefined") {
      speechOutput = cocktail.name + " is a drink that requires";
      for(i=0; i<cocktail.ingredients.length; i++) {
        if(cocktail.ingredients.length > 1 && i==cocktail.ingredients.length-1) {
          speechOutput += " and ";
        } else {
          speechOutput += ", "
        }
        if(typeof cocktail.ingredients[i].part == "number") {
          speechOutput +=
                  + cocktail.ingredients[i].part
                  + " part "
                  + cocktail.ingredients[i].mixer
        } else {
          speechOutput += cocktail.ingredients[i].part + " " + cocktail.ingredients[i].mixer;
        }
      }
      speechOutput += ". "
      if(typeof cocktail.glass != 'undefined') {
        speechOutput += "Usually served in a " + cocktail.glass + ". ";
      }
      if(typeof cocktail.garnish != 'undefined') {
        speechOutput += "Garnished with "+cocktail.garnish+ ". ";
      }
  } else {
      speechOutput = "I'm sorry. I don't know how to make a " + cocktailName;
  }
  return speechOutput;
}

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    }
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    }
}

var options = {
  caseSensitive: false,
  includeScore: false,
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  keys: ["name"]
};
var fuse = new Fuse(cocktails, options);
