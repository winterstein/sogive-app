/* eslint-disable react/no-multi-comp */ // Don't complain about more than one React class in the file
import React from 'react';
import _ from 'lodash';
// import {Button, Form, FormGroup, FormControl, Glyphicon, InputGroup} from 'react-bootstrap';
import { Form, Button } from "reactstrap";
import { encURI, modifyHash, stopEvent } from "../base/utils/miscutils";

import Login from "../base/youagain";
import printer from "../base/utils/printer";
import ServerIO from "../plumbing/ServerIO";
import List from "../base/data/List";
import DataStore, { getValue, setValue } from "../base/plumbing/DataStore";
import NGO from "../data/charity/NGO2";
import Project from "../data/charity/Project";
import Output from "../data/charity/Output";
import Misc from "../base/components/Misc";
import PropControl from '../base/components/PropControl';
import { impactCalc } from "./ImpactWidgetry";
import C from "../C";
import { getId } from "../base/data/DataClass";
import { LearnAboutRatings } from "./LearnAboutRatings";
import { DonateButton } from './DonationWizard';
import { RatingBadge } from "./CharityPage";

// #Minor TODO refactor to use DataStore more. Replace the FormControl with a PropControl
// #Minor TODO refactor to replace components with simpler functions

const MAX_RESULTS = 10000;
const RESULTS_PER_PAGE = 20;
const MAX_PAGES = 10;

const PATH = ["widget", "search"];

const SearchPage = () => {
    // query comes from the url
    let q = DataStore.getUrlValue("q");
    const all = !q;
    let from = DataStore.getUrlValue("from") || 0;
    const status = DataStore.getUrlValue("status") || "";
    let impact = DataStore.getUrlValue("impact");
    if (q === "ERROR") {
        // HACK
        throw new Error("Argh!");
    }

    // search hits
    const lpath = ["list", "NGO", status || "pub", q || "all", from]; // listPath({type:C.TYPES.NGO, status, q});
    let pvList = DataStore.fetch(lpath, () => {
        // size: RESULTS_PER_PAGE <- no, caps the results at 20
        return ServerIO.searchCharities({ q, from, status, impact }); // size:1000 if you need more results
    });
    console.log(pvList);
    let total = pvList.value ? List.total(pvList.value) : null;
    let results = pvList.value ? List.hits(pvList.value) : null;
    // const results = DataStore.resolveDataList(results0); // NB: This emitted errors "bad ref in DataStore list - missing status|type|id"

    return (
        <div className="SearchPage row">
            <div className="col-md-12">
                <SearchForm query={q} from={from} status={status} />
            </div>

            <div className="col-md-12">
                {pvList.value ? (
                    <SearchResults
                        {...{ results, total, from, query: q, all, impact }}
                    />
                ) : (
                    <Misc.Loading />
                )}
            </div>

            <div className="col-md-10">
                <FeaturedCharities />
            </div>
        </div>
    );
};
export default SearchPage;

const FeaturedCharities = () => null;

/**
 * TODO change into a PropControl??
 */
const SearchForm = ({ q, status }) => {
    let rawq = getValue([...PATH, "rawq"]);
    if (rawq === undefined && q) {
        setValue(["widget", "search", "rawq"], q);
    }

    // set the search query (this will trigger a search)
    const onSubmit = (e) => {
        stopEvent(e);
        DataStore.setUrlValue("q", rawq);
    };

    const searchIcon = <Misc.Icon prefix="fas" fa="search" />;

    const submitButton = (
        <Button type="submit" color="primary" className="sogive-search-box">
            Search
        </Button>
    );

    return (
        <div className="gradient">
            <div className="worldImage">
                <div className="SearchForm">
                    <h2 className="header-section-title">
                        Search for a charity
                    </h2>
                    <Form onSubmit={onSubmit} className="sogive-search-box">
                        <PropControl
                            path={PATH}
                            prop="rawq"
                            type="search"
                            placeholder="Enter a charity's name"
                            prepend={searchIcon}
                            append={submitButton}
                            size="lg"
                        />
                        <FieldClearButton />
                        {status ? (
                            <div>Include listings with status: {status}</div>
                        ) : null}
                    </Form>
                </div>
            </div>
        </div>
    );
}; //./SearchForm

export const FieldClearButton = ({ onClick }) => (
    <span className="field-clear-button visible-xs-block" onClick={onClick}>
        <Misc.Icon prefix="fas" fa="remove-circle" />
    </span>
);

/**
 *
 * CAREFUL WITH REFACTORS! Used in a few pages
 *
 * @param {
 * 	results: {!NGO[]} the charities
 * 	CTA: {?ReactComponent} allows the Read More button to be replaced
 * 	onPick: {?Function} charity =>
 * 	tabs {Boolean|String[]}
 * 	loading {?Boolean}
 * }
 */
const SearchResults = ({
    results,
    total,
    query,
    from,
    all,
    impact,
    CTA,
    onPick,
    tabs,
    download,
    loading,
}) => {
    if (!results) results = [];
    // NB: looking for a ready project is deprecated, but left for backwards data compatibility
    // TODO adjust the DB to have ready always on the charity
    let ready = _.filter(results, NGO.isReady);
    let unready = _.filter(results, (r) => !NGO.isReady(r));
    // cap size
    ready = ready.slice(0, RESULTS_PER_PAGE);
    unready = unready.slice(0, RESULTS_PER_PAGE);
    let resultsForText = "";
    if (all) {
        resultsForText = `All charities by rating`;
    } else {
        resultsForText = `Searching for “${query}”`;
    }
    const ratingsDescription = (
        <div className="search-page-description">
            <p className="div-section-text">
                We've listed here all charities based on their rating, from gold
                to bronze. You can read more about what the gold, silver, and
                bronze ratings mean here.
            </p>
            <LearnAboutRatings isButton={true} />
        </div>
    );
    // TODO refactor to use ListLoad
    return (
        <div className="SearchResults">
            {tabs !== false ? (
                <h1 className="top-tab header-centred">{resultsForText}</h1>
            ) : null}
            {all ? ratingsDescription : null}
            <SearchResultsNum results={results} total={total} query={query} />
            <div className="results-list">
                {ready.map((item) => (
                    <SearchResult
                        key={getId(item)}
                        item={item}
                        onPick={onPick}
                        CTA={CTA}
                    />
                ))}
                {unready.length ? (
                    <div className="unready-results">
                        <h3>Analysis in progress</h3>
                        SoGive is working to collect data and model the impact
                        of every UK charity -- all 200,000.
                    </div>
                ) : null}
                {unready.map((item) => (
                    <SearchResult
                        key={getId(item)}
                        item={item}
                        onPick={onPick}
                        CTA={CTA}
                    />
                ))}
                <SearchPager total={total} from={from} />
            </div>
            {results.length === 0 && query && !loading ? (
                <SuggestCharityForm />
            ) : null}
            {download !== false ? (
                <div className="col-md-12">
                    <DownloadLink total={total} />
                </div>
            ) : null}
        </div>
    );
}; //./SearchResults

/**
 * TODO allow users to suggest extra charities
 */
const SuggestCharityForm = () => {
    let fpath = ["widget", "SuggestCharityForm"];
    let formData = DataStore.getValue(fpath);

    // extra MyLoop vars
    DataStore.setValue(fpath.concat("notify"), "matt@sogive.org,sanjay@sogive.org", false);
    DataStore.setValue(fpath.concat("controller"), "sogive.org", false);

    let profilerEndpoint = "https://profiler.good-loop.com/form/sogive";
    // 'http://localprofiler.winterwell.com/form/sogive';

    return (
        <div className="SuggestCharityForm">
            <p>
                Can't find the charity you want? If you fill in the details
                below, we'll try to add it to the database. If you're
                registering for an event, you can go ahead - enter "TBD" and you
                can come back and set the charity later.
            </p>
            <PropControl
                path={fpath}
                prop="charityName"
                label="Name of charity"
            />
            <PropControl
                path={fpath}
                prop="website"
                label="Charity website"
            />
            <PropControl
                path={fpath}
                prop="facebook"
                label="Charity Facebook page (if applicable)"
            />
            <PropControl
                path={fpath}
                prop="contactEmail"
                label="Contact email for charity"
            />
            <PropControl
                path={fpath}
                prop="contactPhone"
                label="Contact phone number for charity"
            />
            <PropControl path={fpath} prop="email" label="Your email" />
            <Misc.SubmitButton
                url={profilerEndpoint}
                path={fpath}
                onSuccess={<p>Thank you for suggesting this charity.</p>}
            >
                Submit
            </Misc.SubmitButton>
        </div>
    );
};

const SearchResultsNum = ({ results, total, query }) => {
    if (total === undefined) total = results.length; // fallback
    let loading = DataStore.getValue("widget", "Search", "loading");
    if (loading)
        return (
            <div className="num-results">
                <Misc.Loading />
            </div>
        );
    if (results.length || query) {
        const plural = total !== 1 ? "charities found" : "charity found";
        return (
            <div className="num-results div-section-text">
                {total} {plural}
            </div>
        );
    }
    return <div className="num-results" />; // ?!
};

const ellipsize = (string, length) => {
    if (string && string.length) {
        if (string.length < length) {
            return string;
        }
        return string.slice(0, length) + "…";
    }
    return "";
};

const DefaultCTA = ({ itemUrl, onClick, item }) => {
    return (
        <a href={itemUrl} onClick={onClick}>
            <Button color="primary">Read more</Button>
        </a>
    );
};

/**
 * {
 * 	item: {!NGO} the charity
 * 	CTA: {?ReactComponent: {itemUrl, onClick, item} => jsx} allows the Read More button to be replaced
 * }
 */
const SearchResult = ({ item, CTA, onPick }) => {
    if (!CTA) CTA = DefaultCTA;
    let project = NGO.getProject(item);
    let status = item.status;
    let page = C.KStatus.isDRAFT(status) ? "edit" : "charity";
    const cid = NGO.id(item);
    const charityUrl = "#" + page + "?charityId=" + encURI(cid);

    // We need to make impact calculations so we can say e.g. "£1 will find X units of impact"
    // We also need to store the suggested donation amount so the user can tweak it on the fly with buttons
    let targetCount = DataStore.getValue([
        "widget",
        "SearchResults",
        cid,
        "targetCount",
    ]);
    // The donation picker needs to store its value
    // DataStore.setValue(['widget','ImpactCalculator', NGO.id(item), 'amount'], newAmount);
    const impact = project
        ? impactCalc({
              charity: item,
              project,
              output: project && Project.outputs(project)[0],
              targetCount: targetCount || 1,
          })
        : null;

    // Does the desc begin with the charity name? Strip it and make a sentence!
    // NB: exact matches only, to avoid mangling names
    const charityName = NGO.displayName(item);
    let charityDesc = item.summaryDescription || item.description || "";
    if (charityDesc.substr(0, charityName.length).toLowerCase() === charityName.toLowerCase()) {
        charityDesc = "... "+charityDesc.slice(charityName.length).trim();
    }
    // hack: remove markdown links
    charityDesc = charityDesc.replace(/\[([^\]]+)\]\(\S+\)/g,"$1");
    // Some elements need to be shrunk down if they're too long
    const longName = charityName.length > 25;

    /** if onPick is defined, then stop the click and call onPick */
    let onClick = null;
    if (onPick) {
        assMatch(onPick, Function);
        onClick = (e) => {
            stopEvent(e);
            onPick(item);
        };
    }

    // NB re formatting below - beware of React eating spaces
    const impactExplanation = impact ? (
        <div className="impact std-padding col-md-6 d-none d-sm-block">
            <h4>IMPACT CALCULATOR</h4>
            <p className="impact-summary">
                <Misc.Money
                    amount={Output.cost(impact)}
                    maximumFractionDigits={2}
                    maximumSignificantDigits={2}
                />
                <span className="impact-calculator-text">may fund</span>
                <span className="impact-count">{printer.prettyNumber(Output.number(impact), 2)}</span>
                <span className="impact-calculator-text">{Output.getName(impact)}</span>
            </p>
            <div className="click-through-action">
                <CTA itemUrl={charityUrl} onClick={onClick} item={item} />
            </div>
            <DonateButton item={item} isOutlined={true} isLarge={false} />
        </div>
    ) : null;

    const noImpact = !impact ? (
        <div className="impact std-padding col-md-6 d-none d-sm-block">
            <p>Impact information is not available for this charity.</p>
            <div className="click-through-action">
                <CTA itemUrl={charityUrl} onClick={onClick} item={item} />
            </div>
            <DonateButton item={item} isOutlined={true} isLarge={false} />
        </div>
    ) : null;
    return (
        <div
            className={
                "std-border SearchResult  row impact-" + NGO.impact(item)
            }
            data-id={cid}
        >
            {item.logo && (
                <a
                    href={charityUrl}
                    onClick={onClick}
                    className="logo col-md-2 col-xs-4"
                >
                    <img
                        className="charity-logo"
                        src={NGO.logo(item)}
                        alt={`Logo for ${charityName}`}
                    />
            </a>
            )}
            <a
                href={charityUrl}
                onClick={onClick}
                className="text-summary std-padding searchpg-flex-grow col-md-4 col-xs-8"
            >
                <h3 className="name charity-card-title">{charityName}</h3>
                <p className="description">
                    {ellipsize(charityDesc, 140)}
                </p>
                <RatingBadge charity={item} heightpx="36" />
            </a>
            {impactExplanation}
            {noImpact}
        </div>
    );
}; //./SearchResult

const ImpactBadge = ({ charity }) => {
    if (!NGO.isReady(charity)) return null;
    if (NGO.isHighImpact(charity)) charity.impact = "high"; // old data HACK
    if (!charity.impact || charity.impact === "more-info-needed") return null;
	const label = C.IMPACT_LABEL4VALUE[charity.impact];
    if (charity.impact === "very-low") {
        return (
            <span
                className="impact-rating pull-right text-warning"
                title="We suggest avoiding this charity"
            >
                <Misc.Icon fa="times" /> {label}
            </span>
        );
    }
    let help = {
        high: "Gold: a high impact charity with solid data",
        medium: "Silver: an effective charity",
        low:
            "Not Recommended: we believe the charity does less good than our Gold-rated charities",
    }[charity.impact];
    return (
        <span className={"impact-rating pull-right text-" + label} title={help}>
            <Misc.Icon fa="award" /> {label}
        </span>
    );
};

const SearchPager = ({ total, from = 0 }) => {
    const pageCount = Math.min(
        Math.ceil(total / RESULTS_PER_PAGE),
        MAX_RESULTS / RESULTS_PER_PAGE
    );
    const thisPage = Math.ceil(from / RESULTS_PER_PAGE + 1);
    const pageNumbers = [];
    if (pageCount > MAX_PAGES) {
        // Present a "nice" abbreviated list of page numbers
        // Always first and last, always 2 (if they exist) either side of current page
        if (thisPage <= 4) {
            for (let i = 1; i <= thisPage + 2; i++) {
                pageNumbers.push(i);
            }
            pageNumbers.push("…");
            pageNumbers.push(pageCount);
        } else if (thisPage >= pageCount - 3) {
            pageNumbers.push(1);
            pageNumbers.push("…");
            for (let i = thisPage - 2; i <= pageCount; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push("1");
            pageNumbers.push("…");
            for (let i = thisPage - 2; i <= thisPage + 2; i++) {
                pageNumbers.push(i);
            }
            pageNumbers.push("…");
            pageNumbers.push(pageCount);
        }
    } else {
        for (let i = 1; i <= pageCount; i++) {
            pageNumbers.push(i);
        }
    }

    const pageLinks = pageNumbers.map((pageNum, index) => {
        if (Number.isInteger(pageNum)) {
            if (pageNum === thisPage) {
                return (
                    <span
                        key={`search-page-${pageNum}`}
                        className="pager-button current-page"
                        title={`Viewing page ${pageNum}`}
                    >
                        {pageNum}
                    </span>
                );
            }
            return (
                <PageLink key={`search-page-${pageNum}`} pageNum={pageNum} />
            );
        }
        return (
            <span
                key={`search-page-gap-${index}`}
                className="pager-button no-page"
            >
                {pageNum}
            </span>
        );
    });

    if (thisPage > 1) {
        pageLinks.unshift(
            <PageLink
                key="search-page-prev"
                pageNum={thisPage - 1}
                title="Previous page"
            >
                &lt;
            </PageLink>
        );
    }
    if (thisPage > 2) {
        pageLinks.unshift(
            <PageLink key="search-page-first" pageNum={1} title="First page">
                &lt;&lt;
            </PageLink>
        );
    }
    if (pageCount - thisPage > 0) {
        pageLinks.push(
            <PageLink
                key="search-page-next"
                pageNum={thisPage + 1}
                title="Next page"
            >
                &gt;
            </PageLink>
        );
    }
    if (pageCount - thisPage > 1) {
        pageLinks.push(
            <PageLink
                key="search-page-last"
                pageNum={pageCount}
                title="Last page"
            >
                &gt;&gt;
            </PageLink>
        );
    }

    return <div className="search-pager">{pageLinks}</div>;
};

const PageLink = ({ pageNum, title, children }) => {
    const newFrom = (pageNum - 1) * RESULTS_PER_PAGE;
    const newHash = modifyHash(null, { from: newFrom }, true);
    const goToPage = (event) => {
        DataStore.setUrlValue("from", newFrom);
        event.stopPropagation();
        event.preventDefault();
    };

    return (
        <a
            href={window.location.pathname + newHash}
            className="pager-button"
            onClick={goToPage}
            title={title || `Go to page ${pageNum}`}
        >
            {children || pageNum}
        </a>
    );
};

const DownloadLink = ({ total }) => {
    let noCos = false;
    if (!Login.isLoggedIn()) noCos = "not logged in";
    if (!total) noCos = "no results";
    const locn = "" + window.location;
    const qi = locn.indexOf("?");
    const qry = qi === -1 ? "" : locn.substr(qi + 1);

    if (noCos) {
        return null;
    }
    return (
        <a
            className="pull-right"
            title="Download these results in .csv (spreadsheet) format"
            href={"/search.csv?" + qry}
            download="charities.csv"
            target="_new"
        >
            <Button color="primary">Download csv</Button>
        </a>
    );
};

export { SearchResults };
