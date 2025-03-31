'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useAuthStore } from '@/lib/store/auth-store';
import { Form, Input, Button } from 'antd-mobile';
import { SpinLoading } from 'antd-mobile';
import AddressModal from '@/components/modals/address-modal';
import { LocationFill } from 'antd-mobile-icons';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  address?: string;
  phone?: string;
  avatar?: string;
}

export default function ProfileForm() {
  const { loginUser } = useAuthStore();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  // 表单初始值
  const [form] = Form.useForm();
  
  // 获取当前用户信息
  const { isLoading: isLoadingUser } = trpc.user.getCurrentUser.useQuery(undefined, {
    enabled: !!loginUser?.id,
    // 当获取到用户信息后，设置表单初始值
    onSuccess: (data) => {
      if (data) {
        form.setFieldsValue({
          firstName: data.user_metadata?.firstName || '',
          lastName: data.user_metadata?.lastName || '',
          address: data.user_metadata?.address || '',
          phone: data.user_metadata?.phone || '',
          avatar: data.user_metadata?.avatar || '',
        });
      }
    }
  });
  
  // 更新用户资料mutation
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      // Dialog.alert({
      //   content: '更新成功',
      // });
      console.log('更新成功');
    },
    onError: (error) => {
      // Dialog.alert({
      //   content: error.message || '更新失败，请稍后重试',
      // });
      console.log('更新失败', error);
    }
  });
  
  // 处理表单提交
  const handleSubmit = async (values: ProfileFormValues) => {
    if (!loginUser?.id) return;
    
    try {
      await updateProfile.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        address: values.address,
        phone: values.phone,
        avatar: values.avatar,
      });
    } catch (error) {
      console.error('Update profile failed:', error);
    }
  };
  
  // 打开地址选择模态框
  const showAddressModal = () => {
    setIsAddressModalOpen(true);
  };
  
  // 处理地址选择
  const handleAddressSelect = (selectedAddress: string) => {
    form.setFieldsValue({ address: selectedAddress });
    setIsAddressModalOpen(false);
  };

  if (isLoadingUser || !loginUser) {
    return (
      <div className="flex justify-center items-center h-full">
        <SpinLoading color="primary" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Edit profile</h1>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        footer={
          <Button 
            block 
            color="primary" 
            size="large" 
            type="submit"
            loading={updateProfile.isLoading}
          >
            Save changes
          </Button>
        }
      >
        <Form.Item
          name="firstName"
          label="First name"
          rules={[{ required: true, message: 'Please enter first name' }]}
        >
          <Input placeholder="Please enter first name" />
        </Form.Item>
        
        <Form.Item
          name="lastName"
          label="Last name"
          rules={[{ required: true, message: 'Please enter last name' }]}
        >
          <Input placeholder="Please enter last name" />
        </Form.Item>
        
        <Form.Item
          name="phone"
          label="Phone number"
        >
          <Input placeholder="Please enter phone number" type="tel" />
        </Form.Item>
        
        <Form.Item
          name="address"
          label={
            <div className="flex items-center gap-2">
              <LocationFill className="text-lg" />
              <span>Address</span>
            </div>
          }
        >
          <Input 
            placeholder="Please select or enter address" 
            onClick={() => showAddressModal()}
          />
        </Form.Item>
      </Form>
      
      {/* 地址选择模态框 */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSelect={handleAddressSelect}
        initialAddress={form.getFieldValue('address')}
        showSaveButton={false}
      />
    </div>
  );
}
