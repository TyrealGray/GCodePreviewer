function Button({ onClick, children, disabled }: { onClick: () => void, children: React.ReactNode, disabled?: boolean }) {
    return (
        <button className='bg-blue-500 hover:bg-blue-600 rounded-xl p-2 w-1/2 focus:outline-2 focus:outline-offset-2 focus:outline-violet-500' disabled={disabled} onClick={onClick}>{children}</button>
    );
}

export default Button;
