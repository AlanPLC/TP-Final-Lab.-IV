import { useState } from "react";

const useModal = () => {
    const [isModalVisible, setIsModalVisible] = useState(false)

    const openModal = ()=> setIsModalVisible(true)
    const closeModal = ()=> setIsModalVisible(false)
  return {
   isModalVisible,
   openModal,
   closeModal,
  };
};

export default useModal;