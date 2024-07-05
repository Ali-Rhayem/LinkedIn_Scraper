import fetch from "node-fetch";
import fs from "graceful-fs";
import * as cheerio from "cheerio";

async function getJobId(id){
    try{
        const response = await fetch(
            `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${id}`,
            {
                agent: getProxyAgent(),
                headers: {
                    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                    accept: "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "csrf-token": "ajax:1929290742679661885",
                    "sec-ch-ua": '"Not/A)Brand";v="99", "Google Chrome";"v=115","Chromium";v="115"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"macOS"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    Referer: "https://www.linkedin.com/jobs/search?keywords=Marketing&location=United%2BStates&geoId=103644278&f_TPR=r86400&f_WT=2&currentJobId=3687837964&position=1&pageNum=1",
                    "referrer-policy": "strict-origin-when-cross-origin",
                },
                body: null,
                method: "GET",
            }
        );
    }catch(error){

    }
}