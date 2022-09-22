import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import { Container, Row, Col } from 'reactstrap';
import MDText from '../base/components/MDText';
import C from '../C';
import { Banner } from './WebsiteCards';
import reports from '../../../web/reports/reports.json';
import DataStore from '../base/plumbing/DataStore';
import { hardNormalize, space, stopEvent } from '../base/utils/miscutils';
import jquery from '../../puppeteer-tests/test-base/jquery';
import Misc from '../base/components/Misc';

const ReportCard = ({title, slug, date, authors, summary}) => {

    const navigate = (e) => {
        stopEvent(e);
        DataStore.setUrlValue("report", slug);
    }
        
    return <div className='report-card mb-3' onClick={navigate}>
        <Row className='worldImage'>
            <Col md={6} className='p-2 title-side'>
                <h4>{title}</h4>
            </Col>
            <Col md={6} className="text-right p-2">
                <p><i>{date}</i></p>
                <p><b>{authors.join(", ")}</b></p>
                <p>{summary}</p>
            </Col>
        </Row>
    </div>;
};

const ReportPage = ({slug, title, date, authors}) => {

    const [text, setText] = useState(null);

    useEffect(() => {
        setText(null);
        $.get("/reports/" + slug + ".md").then(data => {
            setText(data);
        }).catch(e => {
            setText("There was an error getting the report. Please try again.");
            console.error(e);
        });
    }, [slug]);

    // For content links, we have to make sure headers get appropriate IDs to scroll to
    const ScollHeader = ({level, children, id, ...props}) => {
        const HeaderType = "h"+level;
        // React markdown provides children as a 1-length array for some reason
        if (!id && Array.isArray(children) && typeof children[0] === "string") {
            id = hardNormalize(children[0]);
        }
        return <HeaderType id={id} {...props}>{children}</HeaderType>
    }

    const tryScrollTo = (originalId, contentId) => {

        // no wildcards for tag type, have to do a brute force
        const findHeader = (id) => {
            let e;
            try {
                e = document.querySelector("h1#"+id);
                if (e) return e;
                e = document.querySelector("h2#"+id);
                if (e) return e;
                e = document.querySelector("h3#"+id);
                if (e) return e;
                e = document.querySelector("h4#"+id);
                if (e) return e;
                e = document.querySelector("h5#"+id);
                if (e) return e;
                e = document.querySelector("h6#"+id);
                return e;
            } catch (err) {
                // error on invalid selector - just ignore
                return null;
            }
        }

        // Try the original id first
        let element = findHeader(originalId);
        if (!element) element = findHeader(contentId);
        if (element) {
            element.scrollIntoView();
        // if we cant find anything to scroll to, just redirect to the original link
        } else window.location.href = "/#" + originalId;
    }

    // Attempts to replace broken scroll links with proper functionality
    // Works by heading content so prone to not working - may still need manual fixing
    const ScrollLink = ({href, children, className, ...props}) => {
        // detect hash link
        if (href.startsWith("/#") || href.startsWith("#")) {
            let scrolltoId;
            if (Array.isArray(children) && typeof children[0] === "string") {
                scrolltoId = hardNormalize(children[0]);
            }
            const originalId = href.replace(/^\/#/, "").replace(/^#/, "");
            // Attempt to scroll
            return <a className={space(className, "text-primary")} onClick={() => tryScrollTo(originalId, scrolltoId)} {...props}>{children}</a>
        }
        return <a className={space(className, "text-primary")} href={href} {...props}>{children}</a>;
    }

    const components = {
        h1: ScollHeader,
        h2: ScollHeader,
        h3: ScollHeader,
        h4: ScollHeader,
        h5: ScollHeader,
        h6: ScollHeader,
        a: ScrollLink
    }

    return <div className='report'>
        <a className='text-primary' onClick={() => DataStore.setUrlValue("report", "")}>&lt; Back</a>
        <br/><br/>
        <h1 className='text-center'>{title}</h1>
        <p className='text-right'><i>{date}</i></p>
        <p className='text-right'><i>{authors}</i></p>
        <br/>
        {!text ? <Misc.Loading/>
        : <MDText source={text} components={components}/>}
    </div>;
}

const AnalysisPage = () => {

    const reportSlug = DataStore.getUrlValue("report");
    let report = null;
    if (reportSlug) {
        reports.forEach(r => {
            if (r.slug === reportSlug) report = r;
        });
    }

    return <div className='AnalysisPage'>   
        <Banner title="Analysis"/>
        <br/>
        <Container>
            {!report ? <>
                <h2>In-Depth Research</h2>
                <p className='text-center'>We do thorough analysis on charity projects assessing their impact on the world. Have a look at what we've found!</p>

                {reports.map(report => <ReportCard title={report.title} date={report.date} authors={report.authors} slug={report.slug}/>)}

            </> : <>
                <ReportPage slug={reportSlug} title={report.title} date={report.date} authors={report.authors}/>
            </>}

        </Container>

    </div>;
}

export default AnalysisPage;
