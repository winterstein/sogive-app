import { hardNormalize } from "../base/utils/miscutils";

const rawReports = [
    {
        "title": "Helen Keller International - Vitamin A Supplementation Programme Review",
        "date": "March 2022",
        "authors": ["Good-Loop"],
        "content": ``
    }
];

const reports = {};

for (let i = 0; i < rawReports.length; i++) {
    const slug = hardNormalize(rawReports[i].title);
    reports[slug] = rawReports[i];
    // convinience
    reports[slug].slug = slug;
}

export default reports;
