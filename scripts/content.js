const completedPRSelector = "div.pr-status-completed";
const sprintLabelCls = "sprint-label"
const sprintLabelSpanSelector = "span." + sprintLabelCls;

const mo = new MutationObserver(onMutation);

observe();

function observe()
{
    const options = {
        subtree: true,
        childList: true,
    };
    mo.observe(document, options);
}

function onMutation()
{
    if (document.querySelector(completedPRSelector) && !document.querySelector(sprintLabelSpanSelector))
    {
        mo.disconnect();
        run();
        observe();
    }
}

function log(message)
{
    console.log("[PRSprintLabelExt] " + message);
}

function getSprint(date)
{
    const xmlHttp = new XMLHttpRequest();
    const url = "https://whatsprintis.it/on/" + date.getFullYear() + "/" + (date.getMonth() + 1) +  "/" + date.getDate();
    log("Calling " + url);
    xmlHttp.open("GET", url, false); // false for synchronous request
    xmlHttp.send(null);
    const response = xmlHttp.responseText;
    log("What Sprint It Is returned: " + response);
    const parsed = JSON.parse(response);
    return parsed.sprint;
}

function run()
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