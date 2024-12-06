import React, { useState, useEffect, FC } from 'react';
import useDarkMode from '../hooks/useDarkMode';
import PaginationButtons, { dataPagination, PER_COUNT } from './PaginationButtons';
import PageWrapper from '../layout/PageWrapper/PageWrapper';
import Icon from './icon/Icon';

import Card, { CardBody, CardHeader, CardLabel, CardTitle } from './bootstrap/Card';
import axios from 'axios';
import { useRouter } from 'next/router';
import Avatar from './Avatar';
import USERS from '../common/data/userDummyData';
import Link from 'next/link';


interface ICommonUpcomingEventsProps {
    isFluid?: boolean;
}

interface Employee {
    document: string;
    documentname: string;
    imageurl: string;
    streetAddress2: string;
    name: string;
    email: string;
    type: string;
    designation: string;
    balance: number;
    streetAddress: string;
    city: string;
    salary: number
    stateFull: string;
    zip: string;
    password: string;
    NIC: string;
    // birthday: moment.Moment;
    accountNumber: string;
    bankName: string;
    // membershipDate: moment.Moment;
    _id: string;
    role: string;
}
const CommonUpcomingEvents: FC<ICommonUpcomingEventsProps> = ({ isFluid }) => {

    const router = useRouter();
    const [user, setUser] = useState<Employee>();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [editModalStatus, setEditModalStatus] = useState<boolean>(false);

    const handleClickEdit = () => {
		setEditModalStatus(true);

	};


    return (
        <PageWrapper>
            {/* Table for displaying customer data */}
            <Card stretch={isFluid} onClick={handleClickEdit}>
               
              
                <CardBody isScrollable={isFluid} className='table-responsive'>
                <div className='row g-4'>
                        <div className='col-12'>
                            <div className='row g-4 align-items-center'>
                                <div className='col-lg-auto'>
                                    {selectedImage ?
                                        <img src={selectedImage} className="mx-auto d-block mb-4"
                                            alt="Selected Profile Picture"
                                            style={{ width: '150px', height: '150px', borderRadius: 70 }}
                                        /> : <Avatar
                                            src={USERS.JOHN.src}
                                            color={USERS.JOHN.color}
                                        />}

                                </div>
                                <div className='col-lg'>
                                    <div className='row g-2'>
                                        <p className="fs-1">{user?.name}</p>

                                        <p className='lead text-muted'>
                                           <b> {user?.role}</b><br />
                                            {user?.email}<br/>
                                            <small>{user?.streetAddress},{user?.streetAddress2}, {user?.city}</small>
                                        </p>


                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </CardBody>
            </Card>
           
        </PageWrapper>
    );
};
export default CommonUpcomingEvents;
