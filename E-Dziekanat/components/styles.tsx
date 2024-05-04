import styled from 'styled-components/native';
import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';

const StatusBarHeight: number = Constants.statusBarHeight || 0;

export const Colors = {
    primary: "#ffffff",
    secondary: "#E5E7EB",
    tertiary: "#1F2937",
    darkLight: "#9CA3AF",
    brand: "#6D28D9",
    green: "#10B981",
    red: "#EF4444",
};

const { primary, secondary, tertiary, darkLight, brand, green, red } = Colors;

export const StyledContainer = styled(View)`
    padding: 25px;
    padding-top: ${StatusBarHeight + 10}px;
    background-color: ${primary};
`;

export const InnerContainer = styled(View)`
    flex: 1;
    width: 100%;
    align-items: center;
`;

export const PageLogo = styled(Image)`
    width: 250px;
    height: 200px;
`;

export const PageTitle = styled(Text)`
    font-size: 30px;
    text-align: center;
    font-weight: bold;
    color: ${brand};
    padding: 10px;
`;

export const SubTitle = styled(Text)`
    font-size: 18px;
    margin-bottom: 20px;
    letter-spacing: 1px;
    font-weight: bold;
    color: ${tertiary};
`;

export const StyledFormArea = styled(View)`
    width: 90%;
`;

export const StyledTextInput = styled(TextInput)`
    background-color: ${secondary};
    padding: 15px;
    border-radius: 5px;
    font-size: 16px;
    height: 50px;
    margin-vertical: 3px;
    margin-bottom: 10px;
    color: ${tertiary};
`;

export const StyledLoginTextInput = styled(TextInput)`
    background-color: ${secondary};
    padding: 15px;
    padding-left: 55px;
    padding-right: 55px;
    border-radius: 5px;
    font-size: 16px;
    height: 60px;
    margin-vertical: 3px;
    margin-bottom: 10px;
    color: ${tertiary};
`;

export const StyledInputLabel = styled(Text)`
    color: ${tertiary};
    font-size: 16px;
    text-align: left;
    font-weight: bold;
`;

export const LeftIcon = styled(View)`
    left: 15px;
    top: 38px;
    position: absolute;
    z-index: 1;
`;

export const RightIcon = styled(TouchableOpacity)`
    right: 15px;
    top: 38px;
    position: absolute;
    z-index: 1;
`;

export const StyledButton = styled(TouchableOpacity)`
    padding: 15px;
    background-color: ${brand};
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    margin-vertical: 5px;
    margin-horizontal: 15px;
    height: 50px;
`;

export const ButtonText = styled(Text)`
    color: ${primary};
    font-size: 16px;
    font-weight: bold;
`;

export const MsgBox = styled(Text)`
    text-align: center;
    font-size: 13px;
`;

export const SelectRoleButton = styled(TouchableOpacity)`
    text-align: center;
    font-size: 13px;
    width: 50%;
    borderWidth: 1px;
    borderColor: #ccc;
    paddingHorizontal: 10px;
    marginBottom: 20px;
    backgroundColor: #E5E7EB;
    padding: 15px;
    borderRadius: 5px;
    fontSize: 16px;
    height: 50px;
    marginVertical: 3px;
    marginBottom: 10px;
`;

export const RoleList = styled(View)`
    top: 5px;
    backgroundColor: '#fff';
    borderWidth: 1px;
    borderColor: '#ccc';
    borderRadius: 5px;
    padding: 10px;
    zIndex: 1;
    width: 50%;
    borderWidth: 1px;
    borderColor: '#ccc';
    paddingHorizontal: 10px;
    marginBottom: 20px;
    alignItems: center;
`;

export const Divider = styled(View)`
    height: 1px;
    width: 100%;
    background-color: ${tertiary};
    margin-vertical: 10px;
`;
