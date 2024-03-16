import React, { useState } from "react";
import { StyledContainer, InnerContainer, PageLogo, PageTitle, SubTitle, StyledFormArea, LeftIcon, StyledInputLabel, StyledTextInput, RightIcon, StyledButton, ButtonText, Colors, MsgBox } from '../components/styles';
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { Formik } from 'formik';
import { Octicons, Ionicons } from '@expo/vector-icons';

// colors
const { brand, darkLight } = Colors;

const Login: React.FC = () => {
    const [hidePassword, setHidePassword] = useState<boolean>(true);

    return (
        <StyledContainer>
            <StatusBar style="dark" />
            <InnerContainer>
                <PageLogo resizeMode="cover" source={require('../assets/icon.png')} />
                <PageTitle>E-Dziekanat</PageTitle>
                <SubTitle>Logowanie</SubTitle>

                <Formik
                    initialValues={{ email: '', password: '' }}
                    onSubmit={(values) => {
                        console.log(values);
                    }}
                >
                    {({ handleChange, handleBlur, handleSubmit, values }) => (
                        <StyledFormArea>
                            <MyTextInput
                                label="Adres Email"
                                icon="mail"
                                placeholder="JK12345@ANSNOWYSACZ.edu.pl"
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                value={values.email}
                                keyboardType="email-address"
                            />

                            <MyTextInput
                                label="Hasło"
                                icon="lock"
                                placeholder="* * * * * * * * * *"
                                placeholderTextColor={darkLight}
                                onChangeText={handleChange('password')}
                                onBlur={handleBlur('password')}
                                value={values.password}
                                secureTextEntry={hidePassword}
                                isPassword={true}
                                hidePassword={hidePassword}
                                setHidePassword={setHidePassword}
                            />
                            <MsgBox>...</MsgBox>
                            <StyledButton onPress={handleSubmit}>
                                <ButtonText>Login</ButtonText>
                            </StyledButton>
                        </StyledFormArea>
                    )}
                </Formik>
            </InnerContainer>
        </StyledContainer>
    );

}

interface MyTextInputProps {
    label: string;
    icon: string;
    isPassword?: boolean;
    hidePassword?: boolean;
    setHidePassword?: React.Dispatch<React.SetStateAction<boolean>>;
}

const MyTextInput: React.FC<MyTextInputProps & React.ComponentProps<typeof StyledTextInput>> = ({
    label,
    icon,
    isPassword,
    hidePassword,
    setHidePassword,
    ...props
}) => {
    return (
        <View>
            <LeftIcon>
                <Octicons name={icon} size={30} color={brand} />
            </LeftIcon>
            <StyledInputLabel>{label}</StyledInputLabel>
            <StyledTextInput {...props} />
            {isPassword && (
                <RightIcon onPress={() => setHidePassword && setHidePassword(!hidePassword)}>
                    <Ionicons name={hidePassword ? 'md-eye-off' : 'md-eye'} size={30} color={darkLight} />
                </RightIcon>
            )}
        </View>
    )
}

export default Login;
