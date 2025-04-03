'use client';

/// <reference types="@types/google.maps" />
import { useState, useEffect, useRef } from "react";
import { Dialog, SpinLoading } from 'antd-mobile';
import { Loader } from "@googlemaps/js-api-loader";
import { trpc } from '@/lib/trpc/client';
import { useAuthStore } from '@/lib/store/auth-store';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (address: string) => void;
  initialAddress?: string;
  showSaveButton?: boolean;
}

export default function AddressModal({
  isOpen,
  onClose,
  onSelect,
  initialAddress = '',
  showSaveButton = false,
}: AddressModalProps) {
  const { loginUser, refreshUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState(initialAddress);
  const [searchRange, setSearchRange] = useState(5);
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  
  // 存储地图相关的引用
  const mapRefs = useRef<{
    map: google.maps.Map | null;
    marker: google.maps.Marker | null;
    circle: google.maps.Circle | null;
    autocomplete: google.maps.places.Autocomplete | null;
  }>({
    map: null,
    marker: null,
    circle: null,
    autocomplete: null
  });

  // 更新用户资料mutation
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      // Dialog.alert({
      //   content: 'Address updated successfully',
      // });
      console.log('Address updated successfully');
    },
    onError: (error) => {
      // Dialog.alert({
      //   content: error.message || 'Update failed, please try again later',
      // });
      console.error('Update failed:', error.message || 'Update failed, please try again later');
    }
  });

  // 重置地图状态
  useEffect(() => {
    if (!isOpen) {
      setAddress(initialAddress);
      
      // 清除地图相关引用
      if (mapRefs.current.marker) {
        mapRefs.current.marker.setMap(null);
        mapRefs.current.marker = null;
      }
      
      if (mapRefs.current.circle) {
        mapRefs.current.circle.setMap(null);
        mapRefs.current.circle = null;
      }
    }
  }, [isOpen, initialAddress]);

  // 加载Google Maps API
  useEffect(() => {
    if (!isOpen) return;

    const initMap = async () => {
      setIsLoading(true);
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places'],
        });

        const google = await loader.load();
        setGoogleMapsLoaded(true);
        
        if (mapRef.current) {
          // 初始化地图
          const defaultLocation = { lat: 45.4215, lng: -75.6972 }; // Ottawa
          
          mapRefs.current.map = new google.maps.Map(mapRef.current, {
            center: defaultLocation,
            zoom: 12,
            mapTypeControl: false,
          });

          // 延迟触发地图重绘
          setTimeout(() => {
            if (mapRefs.current.map) {
              google.maps.event.trigger(mapRefs.current.map, 'resize');
              console.log('Triggered map resize');
            }
          }, 300);

          // 添加地图点击事件
          mapRefs.current.map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              // 使用反向地理编码获取地址
              const geocoder = new google.maps.Geocoder();
              geocoder.geocode(
                { location: e.latLng },
                (
                  results: google.maps.GeocoderResult[] | null,
                  status: google.maps.GeocoderStatus
                ) => {
                  if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                    const clickedAddress = results[0].formatted_address;
                    setAddress(clickedAddress);
                    
                    // 更新标记位置
                    if (mapRefs.current.marker) {
                      mapRefs.current.marker.setPosition(e.latLng!);
                    } else {
                      mapRefs.current.marker = new google.maps.Marker({
                        position: e.latLng!,
                        map: mapRefs.current.map,
                        icon: {
                          path: google.maps.SymbolPath.CIRCLE,
                          fillColor: '#4B3621',
                          fillOpacity: 1,
                          strokeWeight: 0,
                          scale: 10,
                        },
                      });
                    }
                    
                    // 更新圆圈位置
                    if (mapRefs.current.circle) {
                      mapRefs.current.circle.setCenter(e.latLng!);
                    } else {
                      mapRefs.current.circle = new google.maps.Circle({
                        strokeColor: '#4B3621',
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: '#4B3621',
                        fillOpacity: 0.1,
                        map: mapRefs.current.map,
                        center: e.latLng!,
                        radius: searchRange * 1000,
                        clickable: false
                      });
                    }
                  }
                }
              );
            }
          });

          // 初始化地址自动完成
          const inputElement = document.getElementById('address-input') as HTMLInputElement;
          if (inputElement) {
            mapRefs.current.autocomplete = new google.maps.places.Autocomplete(inputElement, {
              fields: ['formatted_address', 'geometry'],
            });

            // 监听地址选择事件
            mapRefs.current.autocomplete.addListener('place_changed', () => {
              const place = mapRefs.current.autocomplete?.getPlace();
              if (place?.geometry?.location) {
                setAddress(place.formatted_address || '');
                
                // 更新地图位置
                mapRefs.current.map?.setCenter(place.geometry.location);
                
                // 添加标记
                if (mapRefs.current.marker) {
                  mapRefs.current.marker.setPosition(place.geometry.location);
                } else {
                  mapRefs.current.marker = new google.maps.Marker({
                    position: place.geometry.location,
                    map: mapRefs.current.map,
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: '#4B3621',
                      fillOpacity: 1,
                      strokeWeight: 0,
                      scale: 10,
                    },
                  });
                }
                
                // 添加搜索范围圆圈
                if (mapRefs.current.circle) {
                  mapRefs.current.circle.setCenter(place.geometry.location);
                  mapRefs.current.circle.setRadius(searchRange * 1000);
                } else {
                  mapRefs.current.circle = new google.maps.Circle({
                    strokeColor: '#4B3621',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#4B3621',
                    fillOpacity: 0.1,
                    map: mapRefs.current.map,
                    center: place.geometry.location,
                    radius: searchRange * 1000,
                    clickable: false
                  });
                }
              }
            });
          }

          // 如果有初始地址，尝试地理编码
          if (initialAddress) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode(
              { address: initialAddress },
              (
                results: google.maps.GeocoderResult[] | null,
                status: google.maps.GeocoderStatus
              ) => {
                if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                  const location = results[0].geometry.location;
                  
                  mapRefs.current.map?.setCenter(location);
                  
                  mapRefs.current.marker = new google.maps.Marker({
                    position: location,
                    map: mapRefs.current.map,
                    icon: {
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: '#4B3621',
                      fillOpacity: 1,
                      strokeWeight: 0,
                      scale: 10,
                    },
                  });
                  
                  mapRefs.current.circle = new google.maps.Circle({
                    strokeColor: '#4B3621',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#4B3621',
                    fillOpacity: 0.1,
                    map: mapRefs.current.map,
                    center: location,
                    radius: searchRange * 1000,
                    clickable: false
                  });
                }
              }
            );
          }
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        Dialog.alert({
          content: 'Failed to load map, please try again later',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initMap();
  }, [isOpen, initialAddress, searchRange]);

  // 更新搜索范围
  useEffect(() => {
    if (mapRefs.current.circle && mapRefs.current.map && googleMapsLoaded) {
      mapRefs.current.circle.setRadius(searchRange * 1000);
    }
  }, [searchRange, googleMapsLoaded]);

  // 当模态框打开时，确保地图正确渲染
  useEffect(() => {
    if (isOpen && mapRefs.current.map) {
      // 短暂延迟后重绘地图，解决初始渲染问题
      setTimeout(() => {
        if (mapRefs.current.map) {
          // 手动触发重新计算尺寸
          window.dispatchEvent(new Event('resize'));
          // 触发地图重绘
          google.maps.event.trigger(mapRefs.current.map, 'resize');
          console.log('Modal open, triggered map resize');
          
          // 如果有标记，确保地图居中在标记位置
          if (mapRefs.current.marker) {
            const position = mapRefs.current.marker.getPosition();
            if (position) {
              mapRefs.current.map.setCenter(position);
            }
          }
        }
      }, 100);
    }
  }, [isOpen]);

  const handleSaveAddress = async () => {
    if (!address) return;
    
    try {
      await updateProfile.mutateAsync({
        firstName: loginUser?.user_metadata?.firstName || 'User',
        lastName: loginUser?.user_metadata?.lastName || 'User',
        address: address,
        searchRange: searchRange
      });
      
      // Refresh user data to update the UI
      await refreshUser();
      
      onSelect(address);
      onClose();
    } catch (error) {
      console.error('Failed to save address:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      visible={isOpen}
      content={
        <div className="p-2">
          <div className="mb-4">
            <div className="mb-2 font-medium">Address</div>
            <input
              id="address-input"
              className="w-full p-2 border rounded"
              placeholder="Enter address, landmark or intersection"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-80">
              <SpinLoading color="primary" />
            </div>
          ) : (
            <div 
              ref={mapRef} 
              className="w-full h-80 rounded-lg bg-gray-100 mb-4"
              style={{ minHeight: '320px', display: 'block' }}
            ></div>
          )}
          
          <div className="mb-4">
            <div className="flex justify-between">
              <span>Search range</span>
              <span>{searchRange} km</span>
            </div>
            <input 
              type="range"
              className="w-full"
              min={1}
              max={20}
              value={searchRange}
              onChange={(e) => setSearchRange(Number(e.target.value))}
              step={1}
            />
            <div className="w-full flex justify-between text-xs px-2">
              <span>1</span>
              <span>10</span>
              <span>20</span>
            </div>
          </div>
        </div>
      }
      closeOnAction
      actions={[
        ...(showSaveButton ? [
          {
            key: 'save',
            text: 'Save to my profile',
            bold: true,
            disabled: !address || updateProfile.isLoading,
            onClick: handleSaveAddress
          }
        ] : [
          {
            key: 'confirm',
            text: 'Confirm selection',
            bold: true,
            disabled: !address,
            onClick: () => {
              onSelect(address);
              onClose();
            }
          }
        ]),
        {
          key: 'cancel',
          text: 'Cancel',
          onClick: onClose
        }
      ]}
    />
  );
} 