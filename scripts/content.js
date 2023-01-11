const completedPRSelector = "div.pr-status-completed";
const sprintLabelCls = "sprint-label"
const sprintLabelSpanSelector = "span." + sprintLabelCls;
const pullRequestPageUrl = "https://dev.azure.com/mseng/AzureDevOps/_git/AzureDevOps/pullrequest";
const sprintCache = {};

const observerOptions = {
    subtree: true,
    childList: true,
};
const mo = new MutationObserver(onDocumentMutation);

observe();

function observe()
{
    mo.observe(document, observerOptions);
}

function onDocumentMutation()
{
    if (!window.location.href.startsWith(pullRequestPageUrl))
    {
        return; //we are not at PR page
    }

    if (!document.querySelector(completedPRSelector))
    {
        return; //PR is not completed yet
    }

    if (document.querySelector(sprintLabelSpanSelector))
    {
        return; //sprint label has been added already
    }
    
    mo.disconnect();
    addSprintLabel();
    observe();
}

function log(message)
{
    console.log("[PRSprintLabelExt] " + message);
}

function getSprint(date)
{    
    const key = date.getFullYear() + "/" + (date.getMonth() + 1) +  "/" + date.getDate();    

    if (!sprintCache[key])
    {
        sprintCache[key] = downloadSprint("https://whatsprintis.it/on/" + key);
    }

    return sprintCache[key];
}

function downloadSprint(url)
{
    const xmlHttp = new XMLHttpRequest();
    log("Calling " + url);
    xmlHttp.open("GET", url, false); // false for synchronous request
    xmlHttp.send(null);
    const response = xmlHttp.responseText;
    log("What Sprint It Is returned: " + response);
    const parsed = JSON.parse(response);
    return parsed.sprint;
}

function addSprintLabel()
{
    const dateTimeMergedElement = document.querySelector("div.bolt-table-card time");
    if (!dateTimeMergedElement)
    {
        log("Missing time element.")
        return;
    }
    
    const dateTimeMergedAttr = dateTimeMergedElement.attributes.getNamedItem("datetime");
    if (!dateTimeMergedAttr)
    {
        log("Missing datetime attribute.")
        return;
    }
    
    const dateTimeMerged = new Date(dateTimeMergedAttr.value);
    if (!dateTimeMerged)
    {
        log("Date is not valid.");
        return;
    }

    log("Extracted the merge date: " + dateTimeMerged);
    
    const sprint = getSprint(dateTimeMerged)
    if (!sprint)
    {
        log("An error with sprint.")
        return;
    }
    
    log("Adding sprint label.");

    const span = document.createElement("span");
    span.setAttribute("class", "secondary-text white-space-nowrap " + sprintLabelCls);
    const text = document.createTextNode(", M" + sprint);
    span.appendChild(text);
    dateTimeMergedElement.parentElement.parentElement.appendChild(span);
}