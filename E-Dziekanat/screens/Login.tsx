import React from "react";
import { StyledContainer, InnerContainer, PageLogo, PageTitle } from '../components/styles';
import { Image } from 'react-native';

const Login: React.FC = () => {
    return (
        <StyledContainer>
            <InnerContainer>
                <PageLogo resizeMode="cover" source={require('../assets/icon.png')} />
                <PageTitle>E-Dziekanat</PageTitle>
            </InnerContainer>
        </StyledContainer>
    );
}

export default Login;
