import React from 'react'
import { useForm } from 'react-hook-form'
import { JSBI, Percent } from '@uniswap/sdk';
import { Input } from './Input/index';
import { PrimaryButton } from './SubmitButton';
import styled from 'styled-components';

const FormContainer = styled.div<{displayThis?: boolean | undefined}>`
${({ theme }) => theme.flexColumnNoWrap}
position: relative;
border-radius: 1.25rem;
background-color: ${({ theme }) => theme.bg1};
z-index: 1;
width: 100%;
display: ${({displayThis}) => displayThis===undefined? 'grid': displayThis? 'grid':'none'};
`


const Form = styled.form`
`


export default function IssuePannel(  {register, handleSubmit, control, errors, watch}: {register:any, handleSubmit:any, control: any, errors: any, watch: any} ) {

    return (
        <FormContainer>
            <Form >
                {/* register your input into the hook by invoking the "register" function */}
                <Input name="daoName" label="DAO/Token name"  
                ref={register} 
                error={!!errors?.daoName} 
                errorMessage={errors?.daoName?.message} />
                <Input name="tokenSymbol" type="text" label="Token Symbol"  ref={register} error={!!errors?.tokenSymbol} errorMessage={errors?.tokenSymbol?.message} />
                <Input name="totalSupply" type="text" label="Total Supply" ref={register}  error={!!errors?.totalSupply} errorMessage={errors?.totalSupply?.message} />
               
            </Form>
        </FormContainer>
    )
}