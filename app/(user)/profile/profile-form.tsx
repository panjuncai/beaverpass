'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useAuthStore } from '@/lib/store/auth-store';
import { Form, Input, Button, Avatar, ImageUploader } from 'antd-mobile';
import { SpinLoading } from 'antd-mobile';
import AddressModal from '@/components/modals/address-modal';
import { CameraOutline, LocationFill } from 'antd-mobile-icons';
import { compressImage } from '@/lib/utils/image-compression';
import type { ImageUploadItem } from 'antd-mobile/es/components/image-uploader';

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
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);
  
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
      // Toast.show({
      //   icon: 'success',
      //   content: '更新成功',
      // });
      // 更新成功后，将临时头像设为 null
      setTempAvatar(null);
      setFileList([]);
    },
    onError: (error) => {
      // Toast.show({
      //   icon: 'fail',
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
        avatar: tempAvatar || values.avatar,
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

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    const compressedFile = await compressImage(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 800,
    });
    
    // 将压缩后的文件转换为 base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
    });
    
    reader.readAsDataURL(compressedFile);
    const base64String = await base64Promise;
    
    // 设置临时头像为 base64 字符串
    setTempAvatar(base64String);
    
    return {
      url: base64String,
    };
  };

  // 打开头像上传模态框
  const showAvatarModal = () => {
    setIsAvatarModalOpen(true);
  };

  // 关闭头像上传模态框
  const closeAvatarModal = () => {
    setIsAvatarModalOpen(false);
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
      
      {/* 头像部分 */}
      <div className="flex flex-col items-center mb-8">
        <div 
          className="relative cursor-pointer" 
          onClick={showAvatarModal}
        >
          <Avatar
            src={tempAvatar || form.getFieldValue('avatar') || '1'}
            style={{ '--size': '64px' }}
          />
          <div className="absolute bottom-0 right-0 bg-gray-400 text-white rounded-full p-1">
            <CameraOutline />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">Click to change avatar</p>
      </div>
      
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
      
      {/* 头像上传模态框 */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isAvatarModalOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Change avatar</h2>
            <button 
              onClick={closeAvatarModal}
              className="btn btn-ghost btn-circle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <ImageUploader
            value={fileList}
            onChange={setFileList}
            upload={handleImageUpload}
            maxCount={1}
            accept="image/*"
            onDelete={() => {
              setTempAvatar(null);
              setFileList([]);
            }}
          />
          
          <div className="mt-4 flex justify-end gap-2">
            <Button 
              onClick={closeAvatarModal}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              color="primary"
              onClick={() => {
                closeAvatarModal();
                // 头像会在表单提交时一起保存
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
