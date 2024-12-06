import React, { useState, useEffect } from 'react';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../components/bootstrap/Card';
import Timeline, { TimelineItem } from '../../components/extras/Timeline';
import dayjs from 'dayjs';
import Popovers from '../../components/bootstrap/Popovers';
import Icon from '../../components/icon/Icon';
import Link from 'next/link';
import axios from 'axios';



interface BirthdayData {
	name: string;
	birthday: dayjs.Dayjs;
	remainingDays: number;
}



const CommonDashboardRecentActivities = () => {
	const [birthdays, setBirthdays] = useState<BirthdayData[]>([]);

	useEffect(() => {
		const fetchBirthdays = async () => {
			try {
				axios
					.get("http://localhost:8090/user/")
					.then((res: any) => {

						const querySnapshot = res.data

						const birthdayData: BirthdayData[] = [];

						querySnapshot.forEach((doc: any) => {
							birthdayData.push({
								name: doc.name,
								birthday: dayjs(doc.birthday),
								remainingDays: 0, // Initialize remainingDays
							});
						});

						// Get the current date
						const currentDate = dayjs();
						// Filter birthdays for the next 3 weeks ignoring the birth year
						const upcomingBirthdays = birthdayData
							.filter((employee) => {
								const currentMonth = currentDate.format('M');
								const employeeBirthMonth = employee.birthday.format('M');

								// Include only employees whose birthdays are in the same month as the current date
								return currentMonth === employeeBirthMonth;
							})
							.map((employee) => {
								const currentDay = +currentDate.format('D'); // Convert currentDay to number
								const employeeBirthDay = +employee.birthday.format('D'); // Convert employeeBirthDay to number

								// Calculate remaining days
								const remainingDays = employeeBirthDay - currentDay;
								// Ignore birthdays with negative remaining days
								if (remainingDays < 0) {
									return null;
								}

								return { ...employee, remainingDays };
							});
						// Remove null entries
						const validUpcomingBirthdays = upcomingBirthdays.filter(Boolean) as BirthdayData[];

						// Sort validUpcomingBirthdays in ascending order based on remainingDays
						const upcomingBirthdaysSorted = validUpcomingBirthdays.slice().sort((a, b) => a.remainingDays - b.remainingDays);

						setBirthdays(upcomingBirthdaysSorted);
					})
					.catch((err: any) => {
						console.error('Error fetching data: ', err);
					});


				// Declare the array with the specified type


			} catch (error) {
				console.error('Error retrieving upcoming birthdays:', error);
			}
		};

		fetchBirthdays();
	}, []);

	return (
		<Card stretch>
			<CardHeader>
				<CardLabel icon='NotificationsActive' iconColor='danger'>
					<CardTitle tag='h4' className='h5'>
						Birthdays
					</CardTitle>
					<CardSubTitle>This month</CardSubTitle>
				</CardLabel>
			</CardHeader>
			<CardBody isScrollable>
				<Timeline>
					{birthdays.map((employee, index) => (
						<TimelineItem
							key={index}
							label={`in ${employee.remainingDays} days`}
							color='success'
						>
							<Popovers desc='5 stars' trigger='hover'>
								<span>
									{employee.remainingDays === 0 && (
										<>
											<Icon icon='Star' color='warning' />
											<Icon icon='Star' color='warning' />
											<Icon icon='Star' color='warning' />
											<Icon icon='Star' color='warning' />
											<Icon icon='Star' color='warning' />
										</>
									)}
								</span>
							</Popovers>

							<p>
								{employee.remainingDays === 0
									? `${employee.name}'s birthday is today!`
									: `${employee.name}'s birthday days.`
								}
							</p>
						</TimelineItem>
					))}
				</Timeline>
			</CardBody>


		</Card>
	);
};

export default CommonDashboardRecentActivities;
