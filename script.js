
title = 'debugging-prelim-study-exercises';

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Iframe message passing code for Ada code editor ============================================================
const CODE_EDITOR_BASE_URL = "https://code-editor.ada-cs.org/";
const iFrame = document.getElementById("code-editor");
const iFrameContainer = document.getElementById("ide");
let targetDomainSource;
let targetDomainOrigin;
let uid = makeid(10);
iFrame.src = CODE_EDITOR_BASE_URL + "/#" + uid;

function sendMessage(obj) {
    obj.uid = uid;
    if (iFrame instanceof HTMLElement) {
        iFrame.contentWindow?.postMessage(obj, iFrame.src);
    } else if (undefined !== targetDomainSource && undefined !== targetDomainOrigin) {
        targetDomainSource.postMessage(obj, targetDomainOrigin);
    } else {
        // This should only happen if undefined foreignDomain and no message is received yet
        console.log("If foreignDomain is undefined, useIFrameMessages can only reply to messages (i.e. can send only after the first message has been received)");
    }
}

function handleReceive(e) {
    if (e.origin === window.origin) return;

    // Make sure that the data is what we expect, and that it has a correct uid
    if (!(typeof e.data === 'object' && e.data !== null && !Array.isArray(e.data) && e.data.hasOwnProperty('uid')
        && e.data.uid === uid)) {
        return;
    }

    if (e.data.hasOwnProperty('type')) {
        if (!targetDomainSource) {
            targetDomainSource = e.source;
            targetDomainOrigin = e.origin;
        } 
        if (replyCallback && e.source) {
            console.log("Calling reply callback")
            const r = replyCallback(e.data);
            if (r && typeof r === "object") {
                //e.source.postMessage(r);
            }
        }
    }
}

window.addEventListener("message", handleReceive);

// ========================================================================================

/**
 * The function that handles any data returned from the code editor.
 * If you return an object, it will be sent to the editor. Return undefined/null/void to not send a reply.
 * @param {*} data Any logs stored tracked by the code editor at the time of the function being called.
 */
function replyCallback(data) {
    console.log("replyCallback() being called")
    switch (data.type) {
        case "resize":
            if (typeof data.height === "number") {
                // TODO this should actually set the height of the div to data.height
                iFrameContainer.setAttribute("style", `height: ${data.height}px`);
            }
            break;
    }
}

/**
 * Function that initialises the code editor with come code, as defined in the "exercisePrograms" list
 */
function setupFrame() {
    let programText = `print("This program will check if you should apply to be a computing teacher")\nage = int(input("What is your age? "))\ncomputing_degree = input("Do you have a passion for teaching computing? Enter 'yes' or 'no': ")\n\nif age > 21 or computing_degree = "yes":\n  allowed_to_apply = "Successful"\nelse:\n  allowed_to_apply = "Unsuccessful"\n  print("Result of check:",allowed_to_apply)`;
    
    sendMessage({
        type: "initialise",
        code:  programText,
        language: "python",
    });
}