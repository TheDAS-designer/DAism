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
                <Input name="allocationProportion" label="Allocation Proportion" defaultValue="49" ref={register} error={!!errors?.allocationProportion} errorMessage={errors?.allocationProportion?.message} />

                {/* include validation with required or other standard HTML validation rules */}
                <Input name="initialPrice" type="text" label="Initial Price" ref={register} error={!!errors?.initialPrice} errorMessage={errors?.initialPrice?.message}/>
                <Input name="decimal" type="text" label="Decimal" defaultValue="18" ref={register} error={!!errors?.decimal} errorMessage={errors?.decimal?.message} />
                <Input name="tokenName"  type="text" label="Token Name" ref={register} error={!!errors?.tokenName} errorMessage={errors?.tokenName?.message} />
                <Input name="tokenSymbol" type="text" label="Token Symbol"  ref={register} error={!!errors?.tokenSymbol} errorMessage={errors?.tokenSymbol?.message} />
                <Input name="totalSupply" type="text" label="Total Supply" ref={register}  error={!!errors?.totalSupply} errorMessage={errors?.totalSupply?.message} />
               
            </Form>
        </FormContainer>
    )
}