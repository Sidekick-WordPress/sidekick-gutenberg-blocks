import namespace from "../namespace";

interface VersitileMessageProps {
    msg: string;
    type: "normal" | "success" | "error" | "warning";
    textAlign: "left" | "center" | "right";
}

const VersatileMessage = ({ msg, type, textAlign }: VersitileMessageProps) => {
    return (
        <p
            className={`${namespace}-versatile-message ${namespace}-${type}`}
            style={{textAlign}}
        >
            {msg}
        </p>
    )
}

export default VersatileMessage;
