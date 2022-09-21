import React, { useState } from 'react';
import $ from 'jquery';
import { Container, Row, Col } from 'reactstrap';
import MDText from '../base/components/MDText';
import C from '../C';
import { Banner } from './WebsiteCards';
import reports from '../../../web/reports/reports.json';
import DataStore from '../base/plumbing/DataStore';
import { stopEvent } from '../base/utils/miscutils';
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

    useState(() => {
        $.get("/reports/" + slug + ".md").then(data => {
            setText(data);
        }).catch(e => {
            setText("There was an error getting the report. Please try again.");
            console.error(e);
        });
    }, [slug]);

    return <div className='report'>
        {!text ? <Misc.Loading/>
        : <MDText source={text}/>}
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
