function Button({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
    return (
        <button className='bg-blue-500 hover:bg-blue-600 rounded-xl p-2 w-1/2 focus:outline-2 focus:outline-offset-2 focus:outline-violet-500' onClick={onClick}>{children}</button>
    );
}

export default Button;
