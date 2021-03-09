import * as React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Input, Screen } from '../components';
import { Heading3 } from '../components/Typography';
import { Formik } from 'formik';
import validator from 'validator';
import { useCustomer } from '../contexts/Customer';
import RizeClient from '../utils/rizeClient';
import { ComplianceWorkflow } from '@rize/rize-js/types/lib/core/compliance-workflow';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useComplianceWorkflow } from '../contexts/ComplianceWorkflow';
import { Customer } from '@rize/rize-js/types/lib/core/customer';

const logo = require('../assets/images/logo.png');

interface LoginFields {
    email: string;
}

interface LoginScreenProps {
    navigation: StackNavigationProp<RootStackParamList, 'Login'>;
}

export default function LoginScreen({ navigation }: LoginScreenProps): JSX.Element {
    const { setCustomer } = useCustomer();
    const { setComplianceWorkflow } = useComplianceWorkflow();

    const rize = RizeClient.getInstance();

    const initialValues: LoginFields = {
        email: ''
    };

    const styles = StyleSheet.create({
        logo: {
            height: 200,
            width: 200,
            marginTop: -30,
            marginBottom: -10
        },
        inputContainer: {
            marginTop: 35,
            marginBottom: 30,
        }
    });

    const validateForm = (values: LoginFields): any => {
        const errors: any = {};

        if (validator.isEmpty(values.email, { ignore_whitespace: true })) {
            errors.email = 'Email is required.';
        }
        else if (!validator.isEmail(values.email)) {
            errors.email = 'Invalid email address.';
        }

        return errors;
    };

    const createNewComplianceWorkflow = async (email: string): Promise<void> => {
        const newComplianceWorkflow = await rize.complianceWorkflow.create(
            new Date().getTime().toString(),
            email
        );
        const customer = await rize.customer.get(newComplianceWorkflow.customer.uid);

        await setComplianceWorkflow(newComplianceWorkflow);
        await setCustomer(customer);

        navigation.navigate('Disclosures');
    };

    const renewComplianceWorkflow = async (workflow: ComplianceWorkflow): Promise<void> => {
        const newComplianceWorkflow = await rize.complianceWorkflow.renew(
            new Date().getTime().toString(),
            workflow.customer.uid,
            workflow.customer.email
        );
        const customer = await rize.customer.get(newComplianceWorkflow.customer.uid);

        await setComplianceWorkflow(newComplianceWorkflow);
        await setCustomer(customer);

        navigation.navigate('Disclosures');
    };

    const redirectToCurrentStep = async (workflow: ComplianceWorkflow, customer: Customer): Promise<void> => {
        if (workflow.summary.current_step === 1) {
            navigation.navigate('Disclosures');
        } else if (workflow.summary.current_step === 2) {
            // Check if Patriot Act is not yet acknowledged
            const isPatriotActAcknowledged = !!workflow.accepted_documents
                .find(x => x.external_storage_name === 'usa_ptrt_0');

            if (!isPatriotActAcknowledged) {
                navigation.navigate('PatriotAct');
            } else {
                // Check if there are no customer details yet
                if (!customer.details.first_name) {
                    navigation.navigate('PII');
                } else {
                    navigation.navigate('BankingDisclosures');
                }
            }
        }
    };

    const onSubmit = async (values: LoginFields): Promise<void> => {
        const existingCustomers = await rize.customer.getList({
            email: values.email,
            include_initiated: true
        });

        if (existingCustomers.count === 0) {
            await createNewComplianceWorkflow(values.email);
        } else {
            const customer = existingCustomers.data[0];
            
            await setCustomer(customer);
            
            switch (customer.status) {
                case 'initiated': {
                    // Get the latest workflow of the customer
                    const latestWorkflow = await rize.complianceWorkflow.viewLatest(customer.uid);

                    if (latestWorkflow.summary.status === 'expired') {
                        await renewComplianceWorkflow(latestWorkflow);
                    } else {
                        await setComplianceWorkflow(latestWorkflow);
                        await redirectToCurrentStep(latestWorkflow, customer);
                    }

                    break;
                }
                case 'queued':
                case 'identity_verified':
                    navigation.navigate('ProcessingApplication');
                    break;
                case 'active':
                    navigation.navigate('Home');
                    break;
                case 'manual_review':
                case 'under_review':
                    navigation.navigate('ApplicationUnapproved', { status: customer.status });
                    break;
                case 'rejected':
                    navigation.navigate('ApplicationUnapproved', { status: 'rejected' });
                    break;
                default:
                    break;
            }
        }
    };

    return (
        <Screen
            useScrollView
            bounces={false}
        >
            <View style={{
                alignSelf: 'center'
            }}>
                <Image
                    source={logo}
                    resizeMode='contain'
                    resizeMethod='resize'
                    style={styles.logo}
                />
            </View>
            <Heading3 textAlign='center'>Create Account</Heading3>
            <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
                validate={validateForm}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, isValid, isSubmitting, dirty }) => (
                    <>
                        <Input
                            label='Email'
                            containerStyle={styles.inputContainer}
                            autoCapitalize={'none'}
                            keyboardType='email-address'
                            textContentType='emailAddress'
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            errorText={errors.email}
                            editable={!isSubmitting}
                            onSubmitEditing={(): void => handleSubmit()}
                        />
                        <Button
                            title='Submit'
                            disabled={!dirty || !isValid || isSubmitting}
                            onPress={(): void => handleSubmit()}
                        />
                    </>
                )}
            </Formik>
        </Screen>
    );
}