import React from 'react';
import {browserHistory} from 'react-router';

import {Client} from 'app/api';
import {Organization} from 'app/types';
import EventsRequest from 'app/components/charts/eventsRequest';
import LineChart from 'app/components/charts/lineChart';
import Link from 'app/components/links/link';
import ProjectBadge from 'app/components/idBadge/projectBadge';
import LoadingIndicator from 'app/components/loadingIndicator';
import {IconFire, IconLaptop, IconLightning, IconWarning} from 'app/icons';
import {formatFloat, formatPercentage} from 'app/utils/formatters';
import Projects from 'app/utils/projects';
import theme from 'app/utils/theme';
import withApi from 'app/utils/withApi';
import withOrganization from 'app/utils/withOrganization';
import {transactionSummaryRouteWithQuery} from 'app/views/performance/transactionSummary/utils';

import Card from './index';
import {
  CardHeader,
  CardContent,
  CardTitle,
  CardDetail,
  CardBody,
  CardFooter,
  GraphContainer,
} from '../styles';

type Props = Card['props'] & {
  api: Client;
  organization: Organization;
};

class CardPerformance extends React.Component<Props> {
  renderHeader() {
    const {organization, data} = this.props;
    const {transaction = null, project = null} = data ?? {};

    if (transaction === null) {
      return null;
    }

    return (
      <CardHeader>
        <CardContent>
          <CardTitle>{transaction}</CardTitle>
          {project ? (
            <CardDetail>
              <Projects orgId={organization.slug} slugs={[project]}>
                {({projects}) => {
                  const proj = projects.find(p => p.slug === data.project);
                  return (
                    <ProjectBadge
                      project={proj ? proj : {slug: project}}
                      avatarSize={16}
                    />
                  );
                }}
              </Projects>
            </CardDetail>
          ) : null}
        </CardContent>
      </CardHeader>
    );
  }

  renderBody() {
    const {api, organization, data} = this.props;
    const {transaction = null, projectId = null} = data ?? {};

    if (transaction === null || projectId === null || !organization) {
      return null;
    }

    const colors = theme.charts.getColorPalette(1);

    return (
      <CardBody>
        <EventsRequest
          organization={organization}
          api={api}
          query={`transaction:${transaction}`}
          start={undefined}
          end={undefined}
          period="24h"
          interval="60m"
          project={[projectId]}
          environment={[] as string[]}
          includePrevious={false}
          yAxis="apdex(300)"
        >
          {({loading, timeseriesData, errored}) => {
            if (errored) {
              return (
                <GraphContainer>
                  <IconWarning color="gray500" size="md" />
                </GraphContainer>
              );
            }
            if (loading) {
              return (
                <GraphContainer>
                  <LoadingIndicator mini />
                </GraphContainer>
              );
            }

            if (loading) {
              return (
                <GraphContainer>
                  <LoadingIndicator mini />
                </GraphContainer>
              );
            }

            timeseriesData = (timeseriesData || []).map(series => ({
              ...series,
              areaStyle: {
                color: colors[0],
                opacity: 0,
              },
              lineStyle: {
                opacity: 1,
              },
            }));

            return (
              <LineChart
                height={100}
                series={[...timeseriesData]}
                xAxis={{
                  show: false,
                  axisPointer: {
                    show: false,
                  },
                }}
                yAxis={{
                  show: false,
                }}
                tooltip={{
                  show: false,
                }}
                toolBox={{
                  show: false,
                }}
                grid={{
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  containLabel: false,
                }}
                options={{
                  hoverAnimation: false,
                }}
              />
            );
          }}
        </EventsRequest>
      </CardBody>
    );
  }

  renderFooter() {
    const {data} = this.props;
    const {apdex = null, userMisery = null} = data ?? {};

    if (apdex === null || userMisery === null) {
      return null;
    }

    return (
      <CardFooter>
        <span>
          <IconLightning size="xs" /> {formatFloat(apdex, 2)}
        </span>
        <span>
          <IconFire size="xs" /> {formatPercentage(userMisery)}
        </span>
        <span>
          <IconLaptop size="xs" /> 3/4
        </span>
      </CardFooter>
    );
  }

  render() {
    const {organization, data} = this.props;
    const {transaction = null, project = null} = data ?? {};

    const to = transactionSummaryRouteWithQuery({
      orgSlug: organization.slug,
      transaction: String(transaction),
      projectID: project?.id,
      query: {
        // hard coded to match the query above
        environment: [],
        utc: 'true',
        start: undefined,
        end: undefined,
        statsPeriod: '24h',
      },
    });

    return (
      <Link to={to}>
        <Card {...this.props} columnSpan={1} isRemovable={false}>
          {this.renderHeader()}
          {this.renderBody()}
          {this.renderFooter()}
        </Card>
      </Link>
    );
  }
}

export default withApi(withOrganization(CardPerformance));