import { useEffect, useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

import { Food as FoodInterface } from '../../types';

function Dashboard () {

  const [foods, setFoods] = useState<FoodInterface[]>([]);
  const [editingFood, setEditingFood] = useState<FoodInterface>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods() {
      const response = await api.get('/foods');

      setFoods(response.data);
    }
    loadFoods();
  }, [])

  async function handleAddFood(food: FoodInterface) {
    const newFoods = [...foods];

    try {
      const response = await api.post('/foods', {
        food,
        available: true
      });

      const foodFormatted:FoodInterface = {
        ...response.data,
        ...response.data.food
      }
      
      setFoods([...newFoods, foodFormatted]);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleUpdateFood(food: FoodInterface) {
    const newFoods = [...foods];

    if (!editingFood) return;

    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = newFoods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods(foodsUpdated);
    } catch (error) {
      console.log(error);
    }
  }
 

  async function handleDeleteFood (id: number) {
    const newFoods = [...foods];

    await api.delete(`/foods/${id}`);

    const foodsFiltered = newFoods.filter(food => food.id !== id);

    setFoods(foodsFiltered);
  }

  function toggleModal () {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal () {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood (food: FoodInterface) {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
