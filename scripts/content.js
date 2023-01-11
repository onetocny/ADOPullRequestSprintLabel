function getSprint(date)
{
    const xmlHttp = new XMLHttpRequest();
    const url = "https://whatsprintis.it/on/" + date.getFullYear() + "/" + (date.getMonth() + 1) +  "/" + date.getDate();
    console.log("Calling " + url);
    xmlHttp.open("GET", url, false); // false for synchronous request
    xmlHttp.send(null);
    const response = xmlHttp.responseText;
    console.log("What Sprint It Is returned: " + response);
    const parsed = JSON.parse(response);
    return parsed.sprint;
}

function log(message)
{
    console.log("[PRSprintLabelExt] " + message);
}

function run()
{
    const completed = document.querySelector("div.pr-status-completed");
    if (!completed)
    {
        log("PR was not completed yet.");
        return;
    }
    
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
    
    log("Setting sprint label.");
    document.querySelector("div.bolt-table-card time").innerText += ", M" + sprint;
}

//setTimeout(run, 1000); //wait for page to load
run();
//document.addEventListener("DOMContentLoaded", run);