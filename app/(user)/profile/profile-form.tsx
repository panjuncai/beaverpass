'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useAuthStore } from '@/lib/store/auth-store';
import { Form, Input, Button, Avatar, ImageUploader } from 'antd-mobile';
import { SpinLoading } from 'antd-mobile';
import AddressModal from '@/components/modals/address-modal';
import { CameraOutline, LocationFill } from 'antd-mobile-icons';
import type { ImageUploadItem } from 'antd-mobile/es/components/image-uploader';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useRouter } from 'next/navigation';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  address?: string;
  phone?: string;
  avatar?: string;
}

export default function ProfileForm() {
  const router = useRouter();
  const { loginUser } = useAuthStore();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadImage } = useFileUpload();
  
  // 表单初始值
  const [form] = Form.useForm();
  const [shouldResetForm, setShouldResetForm] = useState(true);
  
  // 获取当前用户信息
  const { isLoading: isLoadingUser } = trpc.user.getCurrentUser.useQuery(undefined, {
    enabled: !!loginUser?.id,
    // 当获取到用户信息后，设置表单初始值
    onSuccess: (data) => {
      // 只在组件初始化或明确需要重置表单时才设置表单值
      if (data && shouldResetForm) {
        const avatar = data.user_metadata?.avatar || '';
        form.setFieldsValue({
          firstName: data.user_metadata?.firstName || '',
          lastName: data.user_metadata?.lastName || '',
          address: data.user_metadata?.address || '',
          phone: data.user_metadata?.phone || '',
          avatar: avatar,
        });
        // 同时设置临时头像，确保界面显示
        if (avatar) {
          setTempAvatar(avatar);
        }
        // 设置完成后，将标志设为 false
        setShouldResetForm(false);
      }
    }
  });
  
  // 更新用户资料mutation
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      // 更新成功后，将标志设为 true，允许重新加载表单数据
      setShouldResetForm(true);
      setTempAvatar(null);
      setFileList([]);
      // 跳转到 search 页面
      router.push('/search');
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
    // 获取当前表单所有值
    const currentValues = form.getFieldsValue();
    // 更新地址，同时保留其他字段的值
    form.setFieldsValue({
      ...currentValues,
      address: selectedAddress
    });
    setIsAddressModalOpen(false);
  };

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const imageUrl = await uploadImage(file);
      
      // 更新临时头像 URL 和表单值
      setTempAvatar(imageUrl);
      const currentValues = form.getFieldsValue();
      form.setFieldsValue({
        ...currentValues,
        avatar: imageUrl
      });
      setIsUploading(false);
      
      // 上传成功后自动关闭模态框
      setIsAvatarModalOpen(false);
      
      return {
        url: imageUrl
      };
    } catch (error) {
      setIsUploading(false);
      console.error('Error uploading avatar:', error);
      throw new Error('Upload failed');
    }
  };

  // 打开头像上传模态框
  const showAvatarModal = () => {
    setIsAvatarModalOpen(true);
  };

  // 关闭头像上传模态框
  const closeAvatarModal = () => {
    // 只关闭模态框，不重置表单值
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
        <div className="bg-white rounded-lg p-4 w-[280px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Change avatar</h2>
            <button 
              onClick={closeAvatarModal}
              className="p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="w-[100px]">
              <ImageUploader
                value={fileList}
                onChange={setFileList}
                upload={handleImageUpload}
                maxCount={1}
                accept="image/*"
                deletable={true}
                onDelete={() => {
                  setTempAvatar(null);
                  setFileList([]);
                }}
              />
            </div>
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                <span className="text-gray-600">Uploading...</span>
              </div>
            )}
          </div>
          
          {/* <div className="flex justify-end gap-3">
            <Button 
              onClick={closeAvatarModal}
              className="px-4"
              fill="none"
            >
              Cancel
            </Button>
            <Button 
              color="primary"
              className="px-4"
              onClick={() => {
                closeAvatarModal();
              }}
            >
              Confirm
            </Button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
