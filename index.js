import fetch from "node-fetch";
import fs from "graceful-fs";
import * as cheerio from "cheerio";
import { generateRandomIP, getProxyAgent } from "./utils.js";

async function getJob(id) {
    try {
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
        const html = await response.text();
        const $ = cheerio.load(html);
        const postedTimeAgo = $(".posted-time-ago__text").text().trim();
        const numberOfApplicants = $(".num-applicants__caption").text().trim();
        let jobDescription = $(".show-more-less-html__markup").html();

        jobDescription = jobDescription
            ?.replaceAll("<br>", "\n")
            ?.replaceAll("<ul>", "\n")
            ?.replaceAll("</ul>", "\n")
            ?.replaceAll("<li>", "* ")
            ?.replaceAll("</li>", "\n");

        const $1 = cheerio.load(jobDescription);
        jobDescription = $1.text().trim();

        const company = $(".topcard__org-name-link").text().trim();
        const location = $(".topcard__flavor--bullet").first().text().trim()?.replaceAll("\n", "");
        const title = $(".topcard__title").text().trim();
        const link = $(".topcard__org-name-link").attr("href");
        const criteria = $(".description__job-criteria-item");
        const criteriaJson = [];

        criteria.each((i, item) => {
            const title = $(item).find(".description__job-criteria-subheader").text().trim();
            const value = $(item).find(".description__job-criteria-text").text().trim();
            criteriaJson.push({ title, value });
        });

        return {
            id,
            criteria: criteriaJson,
            company,
            location,
            title,
            link,
            postedTimeAgo,
            numberOfApplicants,
            description: jobDescription,
        };
    } catch (error) {
        console.log("Error in getJob", error.message);
    }
}

async function searchJobs(term, page = 1) {
    try {
        const offset = (page - 1) * 25;
        const res = await fetch(
            `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(term)}&location=United%2BStates&locationId=103644278&f_TPR=r86400&f_WT=2&start=${offset}`,
            {
                headers: {
                    accept: "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "csrf-token": "ajax:7490897683437610063",
                    "priority": "u=1, i",
                    "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"Windows"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    Referer: "https://www.linkedin.com/jobs/engineering-jobs-beirut?trk=homepage-basic_suggested-search&position=1&pageNum=0",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                },
                body: null,
                method: "GET",
            }
        );
        const html = await res.text();
        const $ = cheerio.load(html);
        const json = [];
        const jobs = $(".job-search-card");

        jobs.each((i, job) => {
            const id = $(job).attr("data-entity-urn")?.split(":")[3];
            const title = $(job).find(".base-search-card__title")?.text()?.trim();
            const company = $(job).find(".base-search-card__subtitle").text().trim();
            const link = $(job).find("a").attr("href")?.split("?")[0];
            const location = $(job).find(".job-search-card__location").text().trim();
            json.push({ id, link, title, company, location });
        });

        return json;
    } catch (error) {
        console.log("Error in searchJobs", error.message);
    }
}

(async () => {
    let page = 1;
    const allJobs = [];
    const jobDetailsList = [];
    let hasMoreJobs = true;

    while (hasMoreJobs) {
        const pageJobs = await searchJobs("Computer Science", page);
        if (pageJobs.length === 0) {
            hasMoreJobs = false;
        } else {
            allJobs.push(...pageJobs);
            page++;
            await new Promise((resolve) => setTimeout(resolve, 2000)); 
        }
    }

    console.log(`Total jobs found: ${allJobs.length}`);

    for (let i = 0; i < allJobs.length; i++) {
        const job = allJobs[i];
        const jobDetails = await getJob(job.id);
        console.log(jobDetails);
        jobDetailsList.push(jobDetails);

        fs.writeFileSync('jobDetails.json', JSON.stringify(jobDetailsList, null, 2));
    }

    console.log(`${allJobs.length} Job details saved to jobDetails.json`);
})();
