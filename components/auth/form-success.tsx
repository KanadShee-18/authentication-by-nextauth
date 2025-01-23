import { BsExclamationCircleFill } from "react-icons/bs";

interface FormSuccessProps {
  successMessage?: string;
}

const FormSuccess = ({ successMessage }: FormSuccessProps) => {
  return (
    <div className="flex space-x-4 items-center rounded-lg p-2 text-emerald-500 bg-emerald-500/30">
      <BsExclamationCircleFill className="w-4 h-4" />
      <p>{successMessage}</p>
    </div>
  );
};

export default FormSuccess;
