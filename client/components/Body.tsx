interface BodyProps {
    children: React.ReactNode;
}

export default function Body(props: BodyProps) {
    <div className="flex-grow">
        {props.children}
    </div>
}