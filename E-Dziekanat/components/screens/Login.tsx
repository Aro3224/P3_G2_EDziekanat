import React, { useState } from "react";
import { StyledContainer, InnerContainer, PageTitle, SubTitle, StyledFormArea, LeftIcon, StyledInputLabel, StyledTextInput, RightIcon, StyledButton, ButtonText, Colors, MsgBox } from '../styles';
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { Formik } from 'formik';
import { Octicons, Ionicons } from '@expo/vector-icons';

// colors
const { brand, darkLight } = Colors;

const Login: React.FC = () => {
    const [hidePassword, setHidePassword] = useState<boolean>(true);
    const [message, setMessage] = useState<string>("");

    const handleLogin = (values: { email: string, password: string }) => {
        // Tutaj możesz umieścić logikę obsługi logowania, np. wywołując API do logowania
        console.log(values);

        // W zależności od wyniku logowania, ustaw odpowiednią wiadomość
        setMessage("Kliknąłeś przycisk Login!");
    };

    return (
        <StyledContainer>
            <StatusBar style="dark" />
            <InnerContainer>
                <PageTitle>E-Dziekanat</PageTitle>
                <SubTitle>Logowanie</SubTitle>

                <Formik
                    initialValues={{ email: '', password: '' }}
                    onSubmit={handleLogin}
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
                            <MsgBox>{message}</MsgBox>
                            <StyledButton onPress={() => handleSubmit()}>
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
