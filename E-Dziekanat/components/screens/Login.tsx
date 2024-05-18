import React, { useState } from "react";
import { InnerContainer, PageTitle, SubTitle, StyledFormArea, LeftIcon, StyledInputLabel, RightIcon, StyledButton, ButtonText, Colors, MsgBox, StyledLoginTextInput } from '../styles';
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
import { Formik } from 'formik';
import { Octicons, Ionicons } from '@expo/vector-icons';
import { auth } from '../configs/firebase-config';
import { signInWithEmailAndPassword } from "firebase/auth";

// colors
const { brand, darkLight } = Colors;


const Login: React.FC<{ onLoginSuccess: () => void }> = (props) => {
    const [hidePassword, setHidePassword] = useState<boolean>(true);
    const [message, setMessage] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (values: { email: string, password: string }) => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth, values.email, values.password)
            console.log(response);
            props.onLoginSuccess();
        } catch (error: any) {
            console.log(error);
            setMessage('Logowanie nie powiodło się: ' + error.message)
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={Platform.OS === "web" ? styles.container : styles.containerOS}>
            <StatusBar style="dark"/>
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
                            <MsgBox style={styles.errorMessage}>{message}</MsgBox>
                            <StyledButton onPress={() => handleSubmit()}>
                                <ButtonText>Login</ButtonText>
                            </StyledButton>

                        </StyledFormArea>
                    )}
                </Formik>
            </InnerContainer>
        </View>
        </ScrollView>
    );
}

interface MyTextInputProps {
    label: string;
    icon: string;
    isPassword?: boolean;
    hidePassword?: boolean;
    setHidePassword?: React.Dispatch<React.SetStateAction<boolean>>;
}

const MyTextInput: React.FC<MyTextInputProps & React.ComponentProps<typeof StyledLoginTextInput>> = ({
    label,
    icon,
    isPassword,
    hidePassword,
    setHidePassword,
    ...props
}) => {
    return (
        /*<View>*/
        <View>
            <LeftIcon>
                {icon === 'mail' && <Octicons name="mail" size={30} color={brand} />}
                {icon === 'lock' && <Octicons name="lock" size={30} color={brand} />}
            </LeftIcon>
            <StyledInputLabel>{label}</StyledInputLabel>
            <StyledLoginTextInput {...props} />
            {isPassword && icon === 'lock' && (
                <RightIcon onPress={() => setHidePassword && setHidePassword(!hidePassword)}>
                    <Ionicons name={hidePassword ? 'eye-off' : 'eye'} size={30} color={darkLight} />
                </RightIcon>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: '20%'
    },
    containerOS: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    scrollViewContainer: {
      flexGrow: 1,
    },
    errorMessage: {
        color: 'red',
        fontSize: 18,
    },
});

export default Login;
