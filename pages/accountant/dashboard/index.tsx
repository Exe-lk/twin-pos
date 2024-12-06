import React, { useContext, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTour } from '@reactour/tour';
import PageWrapper from '../../../layout/PageWrapper/PageWrapper';

import ThemeContext from '../../../context/themeContext';
import useDarkMode from '../../../hooks/useDarkMode';
import { TABS, TTabs } from '../../../common/type/helper';
import Page from '../../../layout/Page/Page';
import Incom from "../../../components/income-expenses"

import Profit from "../../../components/profit-chart"
import router from 'next/router';

const Index: NextPage = () => {

  return (
    <PageWrapper>
    

      <Page container='fluid'>
        <div className='row'>
     
        <div className='col-6'>
        <Incom/>
					</div>
					<div className='col-6'>
					<Profit/>
					</div>
        </div>

        

      </Page>

    </PageWrapper>
  )
}

export default Index